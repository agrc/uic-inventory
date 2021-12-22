import clsx from 'clsx';

export const CheckIcon = ({ classes }) => (
  <svg className={classes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M13.5 22.142L7.59 16.42l.636-.636L13.5 20.87 26.721 7.8l.637.637z" />
    <path fill="none" d="M0 0h32v32H0z" />
  </svg>
);

export const PolygonIcon = ({ classes }) => (
  <svg className={classes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M3 7l11 8L29 3v26H3zm1 1.964V28h24V5.081L14.029 16.258z" />
    <path fill="none" d="M0 0h32v32H0z" />
  </svg>
);

export const PointIcon = ({ classes }) => (
  <svg className={classes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M27 3.9L31 28a33.153 33.153 0 0 0-7.538-.8c-6.876 0-8.048 2.6-14.924 2.6A16.273 16.273 0 0 1 1 28L5 3.9a15.376 15.376 0 0 0 4 .905v1.008a15.34 15.34 0 0 1-3.205-.596L2.108 27.434a15.986 15.986 0 0 0 6.43 1.366 20.416 20.416 0 0 0 7.155-1.252 22.375 22.375 0 0 1 7.77-1.348 37.271 37.271 0 0 1 6.312.528L26.124 4.73a27.018 27.018 0 0 0-3.143-.437 4.484 4.484 0 0 0-.201-1.02A25.792 25.792 0 0 1 27 3.9zm-17 .708C10 2.455 12.258 0 16 0s6 2.455 6 4.608v10.665l-6 5.996-6-5.996zm1 0v10.251l5 4.997 5-4.997V4.607C21 3.095 19.262 1 16 1s-5 2.095-5 3.607zm5-.609a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm-2 3a2 2 0 1 0 2-2 2.002 2.002 0 0 0-2 2z" />
    <path fill="none" d="M0 0h32v32H0z" />
  </svg>
);

export const SelectPolygonIcon = ({ classes }) => (
  <svg className={classes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path
      d="M4 15.443V3h9a27.182 27.182 0 0 0 .276 3.992c.992 6.818 3.996 4.572 5.82 11.309.812 2.994.217 5.597 2.03 9.699h-9.96l-2.37-5h5.562zm1.456 9.035L4 26.473V28h3.149z"
      opacity=".25"
    />
    <path d="M12.254 27.964l-.47-.964H13v1h-.738c-.005-.012-.003-.024-.008-.036zm6.485-5.176c.11.853.198 1.508.341 2.186l.979-.207c-.136-.641-.222-1.278-.328-2.106zm-.607-4.226a12.05 12.05 0 0 1 .367 2.054l.996-.097a12.988 12.988 0 0 0-.398-2.218zm-1.687-3.766a7.908 7.908 0 0 1 1.001 1.77l.924-.38a8.835 8.835 0 0 0-1.128-1.994zm-1.42-1.559l.72-.695a8.005 8.005 0 0 1-1.26-1.606l-.866.502a9.102 9.102 0 0 0 1.406 1.8zm-2.28-3.912l.96-.275a15.776 15.776 0 0 1-.429-2.058l-.99.145a16.771 16.771 0 0 0 .458 2.188zM5 7H4v2h1zm0-3h1V3H4v2h1zm5-1H8v1h2zm5 25h2v-1h-2zM5 11H4v2h1zm9.997-7.213c.003.074.008.14.012.213H28v5.97a14.314 14.314 0 0 0-8.996 3.411 8.01 8.01 0 0 1 .454.932A13.213 13.213 0 0 1 28 10.97V27h-5v1h6V3H14.999c-.002.262-.014.522-.002.787zm-2.94 1.147l.998-.067c-.021-.31-.045-.622-.055-.972S13 3 13 3h-1s-.011.635 0 1 .037.636.057.934zM5.456 24.478L2 29.215V13.983L14.358 23H8.797l2.54 5.363-3.232 1.626zM3 26.148l2.611-3.58 2.936 6.079 1.448-.729L7.178 22h4.113L3 15.951zM19 28h2v-1h-2z" />
    <path fill="none" d="M0 0h32v32H0z" />
  </svg>
);

export const CloseIcon = ({ classes }) => (
  <svg className={classes} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M23.985 8.722L16.707 16l7.278 7.278-.707.707L16 16.707l-7.278 7.278-.707-.707L15.293 16 8.015 8.722l.707-.707L16 15.293l7.278-7.278z" />
    <path fill="none" d="M0 0h32v32H0z" />
  </svg>
);

export const OkNotToggle = ({ status, classes }) => {
  const classNames = clsx(classes, 'fill-current', {
    'text-red-500 ': !status,
    'text-emerald-500': status,
  });

  return status ? <CheckIcon classes={classNames} /> : <CloseIcon classes={classNames} />;
};
