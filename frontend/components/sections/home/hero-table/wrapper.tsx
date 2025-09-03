import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function TableWrapper({
  showWrapper,
  children,
}: {
  showWrapper: boolean;
  children: React.ReactNode;
}) {
  if (!showWrapper) {
    return <div className="px-3 sm:px-4">{children}</div>;
  }

  return (
    <div className="relative max-h-[300px] sm:max-h-[400px] overflow-hidden text-white sen">
      {children}
      <div className="absolute bottom-0 left-0 w-full h-8 sm:h-12 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
    </div>
  );
}
