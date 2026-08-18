/**
 * Compatibility layer so the ported pages can keep using the familiar
 * react-router style hooks while the app runs on TanStack Router.
 */
import {
  Link as TanstackLink,
  useNavigate as useTanstackNavigate,
  useRouterState,
  useParams as useTanstackParams,
  useSearch,
} from "@tanstack/react-router";
import { forwardRef, useEffect, type ComponentProps } from "react";

type NavigateOptions = { replace?: boolean; state?: unknown };

export function useNavigate() {
  const navigate = useTanstackNavigate();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    const [pathname, search] = to.split("?");
    navigate({
      to: pathname,
      search: search
        ? Object.fromEntries(new URLSearchParams(search).entries())
        : undefined,
      replace: options?.replace,
    } as never);
  };
}

export function useLocation() {
  return useRouterState({ select: (s) => s.location });
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return (useTanstackParams as unknown as (opts: { strict: false }) => unknown)({ strict: false }) as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams) => void] {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useTanstackNavigate();
  const params = new URLSearchParams(
    Object.entries(search ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    }, {}),
  );
  const setParams = (next: URLSearchParams) => {
    navigate({ search: Object.fromEntries(next.entries()) } as never);
  };
  return [params, setParams];
}

export function Link({
  to,
  ...props
}: Omit<ComponentProps<typeof TanstackLink>, "to"> & { to: string }) {
  return <TanstackLink to={to} {...(props as object)} />;
}

type NavLinkRenderProps = { isActive: boolean; isPending: boolean; isTransitioning: boolean };

export type NavLinkProps = Omit<ComponentProps<"a">, "className" | "href"> & {
  to: string;
  className?: string | ((props: NavLinkRenderProps) => string);
  children?: React.ReactNode | ((props: NavLinkRenderProps) => React.ReactNode);
  end?: boolean;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, className, children, end, ...props }, ref) => {
    const location = useRouterState({ select: (s) => s.location });
    const isActive = end
      ? location.pathname === to
      : location.pathname === to || location.pathname.startsWith(to + "/");
    const state: NavLinkRenderProps = { isActive, isPending: false, isTransitioning: false };
    return (
      <TanstackLink
        ref={ref}
        to={to}
        className={typeof className === "function" ? className(state) : className}
        {...(props as object)}
      >
        {typeof children === "function" ? children(state) : children}
      </TanstackLink>
    );
  },
);
NavLink.displayName = "NavLink";

export { Outlet } from "@tanstack/react-router";

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace]);
  return null;
}
