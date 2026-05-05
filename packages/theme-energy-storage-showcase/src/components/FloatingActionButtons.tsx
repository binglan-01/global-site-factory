import { useCallback } from "react";

/** FAB config after locale resolution (strings only), normally built in `SiteLayout.astro`. */
export type ResolvedFabLink = {
  enabled?: boolean;
  href: string;
  label?: string;
  ariaLabel?: string;
};

export type ResolvedFloatingActions = {
  enquiry?: ResolvedFabLink;
  document?: ResolvedFabLink;
  support?: ResolvedFabLink;
  backToTop?: {
    enabled?: boolean;
    label?: string;
    ariaLabel?: string;
  };
};

export type FloatingActionButtonsProps = {
  actions?: ResolvedFloatingActions | undefined;
};

/** Last-resort accessibility name — theme-agnostic ASCII (avoid company-specific wording). */
const FALLBACK_NAV_NAME = "Shortcut";

function IconChat() {
  return (
    <svg aria-hidden className="energy-storage-fab__svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 5h16v11H9l-5 3v-14a1 1 0 0 1 1-1Zm2 3v5h12V8H6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconDoc() {
  return (
    <svg aria-hidden className="energy-storage-fab__svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 3h8l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 4V5.5L17.5 9H14ZM9 13h8v2H9v-2Zm0-4h5v2H9V9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconSupportHeadset() {
  return (
    <svg aria-hidden className="energy-storage-fab__svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3a9 9 0 0 0-9 9v7h5v-7a4 4 0 1 1 8 0v7h5v-7a9 9 0 0 0-9-9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconChevronUp() {
  return (
    <svg aria-hidden className="energy-storage-fab__svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="m7 14 5-5 5 5H7Z" fill="currentColor" />
    </svg>
  );
}

function FabLink(props: {
  href: string;
  label?: string | undefined;
  /** Prefer explicit aria naming from site config (`ariaLabel` then `label`) before fallback. */
  accessibleName?: string | undefined;
  children: React.ReactNode;
}) {
  const spoken = props.accessibleName ?? props.label ?? FALLBACK_NAV_NAME;
  return (
    <a aria-label={spoken} className="energy-storage-fab__btn" href={props.href}>
      {props.children}
    </a>
  );
}

export function FloatingActionButtons({ actions }: FloatingActionButtonsProps) {
  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!actions) {
    return null;
  }

  const { enquiry, document, support, backToTop } = actions;

  const showEnquiry =
    Boolean(enquiry && enquiry.href.length > 0 && enquiry.enabled !== false);
  const showDocument =
    Boolean(document && document.href.length > 0 && document.enabled !== false);
  const showSupport =
    Boolean(support && support.href.length > 0 && support.enabled !== false);
  const showBack = Boolean(backToTop && backToTop.enabled !== false);

  if (!showEnquiry && !showDocument && !showSupport && !showBack) {
    return null;
  }

  return (
    <aside aria-label="Quick actions" className="energy-storage-fab">
      {showEnquiry && enquiry ? (
        <FabLink accessibleName={enquiry.ariaLabel ?? enquiry.label} href={enquiry.href} label={enquiry.label}>
          <span className="energy-storage-fab__glyph">
            <IconChat />
          </span>
          {enquiry.label ? <span className="energy-storage-fab__label">{enquiry.label}</span> : null}
        </FabLink>
      ) : null}
      {showDocument && document ? (
        <FabLink accessibleName={document.ariaLabel ?? document.label} href={document.href} label={document.label}>
          <span className="energy-storage-fab__glyph">
            <IconDoc />
          </span>
          {document.label ? <span className="energy-storage-fab__label">{document.label}</span> : null}
        </FabLink>
      ) : null}
      {showSupport && support ? (
        <FabLink accessibleName={support.ariaLabel ?? support.label} href={support.href} label={support.label}>
          <span className="energy-storage-fab__glyph">
            <IconSupportHeadset />
          </span>
          {support.label ? <span className="energy-storage-fab__label">{support.label}</span> : null}
        </FabLink>
      ) : null}
      {showBack ? (
        <button
          aria-label={
            backToTop?.ariaLabel ?? backToTop?.label ?? `${FALLBACK_NAV_NAME} · top`
          }
          className="energy-storage-fab__btn energy-storage-fab__btn--top"
          type="button"
          onClick={scrollTop}
        >
          <span className="energy-storage-fab__glyph">
            <IconChevronUp />
          </span>
          {backToTop?.label ? (
            <span className="energy-storage-fab__label">{backToTop.label}</span>
          ) : null}
        </button>
      ) : null}
    </aside>
  );
}
