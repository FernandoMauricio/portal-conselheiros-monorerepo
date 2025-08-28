import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// Hook para buscar dados
export const useFetch = (key, url, options) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get(url);
      return data;
    },
    ...options,
  });
};

// Hook para mutações (POST, PUT, DELETE)
export const useMutate = (key, url, method = "post", options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      let response;
      switch (method.toLowerCase()) {
        case "post":
          response = await api.post(url, payload);
          break;
        case "put":
          response = await api.put(url, payload);
          break;
        case "delete":
          response = await api.delete(url);
          break;
        default:
          throw new Error(`Método HTTP não suportado: ${method}`);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key }); // Invalida o cache para a chave fornecida
    },
    ...options,
  });
};

