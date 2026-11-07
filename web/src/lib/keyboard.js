// Keeps the "Дальше" button above the on-screen keyboard while a note is typed (task Z-6).
//
// Phones handle the keyboard differently:
// - Android (and most Telegram Android builds) shrink the page, so the keyboard
//   takes no extra space and the inset below stays 0.
// - iOS keeps the page height and covers its bottom with the keyboard. Only
//   window.visualViewport shows the part of the page that is still visible.
//
// We measure how much of the page bottom is hidden and store it in the CSS
// variable --kb-inset. The CSS rule for a focused note (index.css, "Z-6")
// pins the bottom button that far above the page bottom, i.e. right on top
// of the keyboard.

export function watchKeyboard() {
  const vv = window.visualViewport;
  if (!vv) return; // very old browsers: the page simply scrolls as before

  const root = document.documentElement;
  const update = () => {
    const hidden = window.innerHeight - vv.height - vv.offsetTop;
    root.style.setProperty('--kb-inset', `${Math.max(0, Math.round(hidden))}px`);
  };

  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}
