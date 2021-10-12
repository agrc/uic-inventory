export default function Tooltip({ children, attrs }) {
  return (
    <div
      className="z-20 max-w-[10rem] px-3 py-1 text-sm text-white lowercase bg-gray-800 rounded-lg shadow-xl pointer-events-none"
      tabIndex={-1}
      {...attrs}
    >
      {children}
      <svg
        className="absolute left-0 w-full h-2 text-black top-full"
        x="0px"
        y="0px"
        viewBox="0 0 255 255"
        xmlSpace="preserve"
      >
        <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
      </svg>
    </div>
  );
}
