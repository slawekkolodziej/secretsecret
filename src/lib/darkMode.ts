type ColorSchemePreferenceHandler = (hasDarkMode: boolean) => void;

function checkColorSchemePreference(fn: ColorSchemePreferenceHandler) {
  if (!window.matchMedia) {
    return;
  }

  const query = window.matchMedia('(prefers-color-scheme: dark)');

  fn(query.matches);

  query.addEventListener('change', (event) => fn(event.matches));
}

checkColorSchemePreference((hasDarkMode) => {
  if (hasDarkMode) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});
