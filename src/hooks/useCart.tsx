import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const ProductIndex = cart.findIndex(
        (product) => product.id === productId
      );

      if (ProductIndex >= 0) {
        const stockProduct = await api
          .get(`stock/${productId}`)
          .then((response) => response.data);

        const newAmount = cart[ProductIndex].amount + 1;

        if (newAmount > stockProduct.amount) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        } else {
          const updateAmount = {
            productId,
            amount: newAmount,
          };

          updateProductAmount(updateAmount);
        }
      } else {
        const product = await api
          .get<Product>(`products/${productId}`)
          .then((response) => response.data);

        const newCart = [
          ...cart,
          {
            ...product,
            amount: 1,
          },
        ];

        setCart(newCart);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      }
    } catch {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const ProductIndex = cart.findIndex(
        (product) => product.id === productId
      );

      if (ProductIndex < 0) {
        toast.error("Erro na remoção do produto");
        return;
      }

      const newCart = cart.filter((product) => product.id !== productId);

      setCart(newCart);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const ProductIndex = cart.findIndex(
        (product) => product.id === productId
      );

      if (ProductIndex < 0) {
        toast.error("Erro na alteração de quantidade do produto");
        return;
      }

      if (amount < 1) {
        toast.error("Erro na alteração de quantidade do produto");
        return;
      }

      if (ProductIndex >= 0) {
        const stockProduct = await api
          .get(`stock/${productId}`)
          .then((response) => response.data);

        if (amount > stockProduct.amount) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        } else {
          const products = cart.map((product) =>
            product.id === productId ? { ...product, amount } : product
          );

          const newCart = products.filter((p) => p.amount > 0);

          setCart(newCart);

          localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        }
      }
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
