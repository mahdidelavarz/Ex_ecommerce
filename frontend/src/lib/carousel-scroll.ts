const EDGE_TOLERANCE = 2;

type CarouselState = {
  atStart: boolean;
  atEnd: boolean;
  progress: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isRtl(el: HTMLElement) {
  return getComputedStyle(el).direction === "rtl";
}

function getCards(el: HTMLElement, selector: string) {
  return Array.from(el.querySelectorAll<HTMLElement>(selector));
}

function isFullyVisible(rect: DOMRect, container: DOMRect) {
  return (
    rect.left >= container.left - EDGE_TOLERANCE &&
    rect.right <= container.right + EDGE_TOLERANCE
  );
}

function getInlineScrollDelta(
  target: HTMLElement,
  containerRect: DOMRect,
  rtl: boolean,
) {
  const targetRect = target.getBoundingClientRect();
  return rtl
    ? targetRect.right - containerRect.right
    : targetRect.left - containerRect.left;
}

export function getCarouselState(
  el: HTMLElement,
  cardSelector: string,
): CarouselState {
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  if (max <= EDGE_TOLERANCE) {
    return { atStart: true, atEnd: true, progress: 1 };
  }

  if (!isRtl(el)) {
    const position = clamp(el.scrollLeft, 0, max);
    return {
      atStart: position <= EDGE_TOLERANCE,
      atEnd: position >= max - EDGE_TOLERANCE,
      progress: position / max,
    };
  }

  const cards = getCards(el, cardSelector);
  const firstCard = cards[0];
  const lastCard = cards[cards.length - 1];

  if (!firstCard || !lastCard) {
    const position = clamp(Math.abs(el.scrollLeft), 0, max);
    return {
      atStart: position <= EDGE_TOLERANCE,
      atEnd: position >= max - EDGE_TOLERANCE,
      progress: position / max,
    };
  }

  const containerRect = el.getBoundingClientRect();
  const firstRect = firstCard.getBoundingClientRect();
  const lastRect = lastCard.getBoundingClientRect();
  const position = clamp(firstRect.right - containerRect.right, 0, max);

  return {
    atStart: isFullyVisible(firstRect, containerRect),
    atEnd: isFullyVisible(lastRect, containerRect),
    progress: position / max,
  };
}

export function scrollCarouselByCards(
  el: HTMLElement,
  cardSelector: string,
  direction: -1 | 1,
) {
  const cards = getCards(el, cardSelector);
  if (cards.length === 0) return;

  const containerRect = el.getBoundingClientRect();
  const rtl = isRtl(el);
  const target = rtl
    ? direction > 0
      ? cards.find(
          (card) =>
            card.getBoundingClientRect().left <
            containerRect.left - EDGE_TOLERANCE,
        ) ?? cards[cards.length - 1]
      : cards
          .slice()
          .reverse()
          .find(
            (card) =>
              card.getBoundingClientRect().right >
              containerRect.right + EDGE_TOLERANCE,
          ) ?? cards[0]
    : direction > 0
      ? cards.find(
          (card) =>
            card.getBoundingClientRect().right >
            containerRect.right + EDGE_TOLERANCE,
        ) ?? cards[cards.length - 1]
      : cards
          .slice()
          .reverse()
          .find(
            (card) =>
              card.getBoundingClientRect().left <
              containerRect.left - EDGE_TOLERANCE,
          ) ?? cards[0];

  el.scrollBy({
    left: getInlineScrollDelta(target, containerRect, rtl),
    behavior: "smooth",
  });
}

export function getDragScrollDelta(el: HTMLElement, pointerDelta: number) {
  return isRtl(el) ? pointerDelta : -pointerDelta;
}
