import { useState, useEffect, useMemo } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
) {
  const { initialPage = 1, initialItemsPerPage = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Calcular datos paginados usando useMemo para optimización
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      paginatedData,
    };
  }, [data, currentPage, itemsPerPage]);

  // Reset a página 1 cuando cambian los datos o items por página
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, itemsPerPage]);

  const goToPage = (page: number) => {
    const maxPage = paginationData.totalPages || 1;
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(paginationData.totalPages || 1);
  };

  return {
    currentPage,
    itemsPerPage,
    totalPages: paginationData.totalPages,
    paginatedData: paginationData.paginatedData,
    startIndex: paginationData.startIndex,
    endIndex: paginationData.endIndex,
    setCurrentPage: goToPage,
    setItemsPerPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
  };
}
