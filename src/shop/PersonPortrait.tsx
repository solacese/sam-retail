import { personName, type Person } from "../simulation/store";

export const hairColor = (id: number) =>
  ["#44332b", "#b67948", "#70503d", "#302d2a", "#c7ab75", "#93958d"][
    Math.floor(id / 3) % 6
  ];

/** The same six hair silhouettes and palette as the little people on the floor. */
export function PersonPortrait({ person: p }: { person: Person }) {
  const hair = hairColor(p.id),
    style = p.id % 6;
  const fringes = [
    "M24 39 Q20 14 48 14 Q77 14 73 39 L67 29 Q48 23 29 30Z",
    "M23 40 Q17 13 45 12 Q76 8 74 40 L67 29 Q44 36 35 24 Q33 36 23 40Z",
    "M22 43 Q19 13 48 13 Q79 13 75 44 L68 32 L28 32Z",
    "M22 36 Q14 27 24 23 Q21 12 34 14 Q39 3 48 12 Q62 4 66 17 Q81 16 76 29 Q83 39 72 40 L67 31 Q49 35 29 30Z",
    "M23 41 Q17 16 48 15 Q79 15 73 42 L67 29 Q47 32 29 28Z",
    "M23 42 Q15 25 31 17 Q48 4 66 17 Q82 26 73 43 L66 29 Q54 34 41 23 Q35 36 23 42Z",
  ];
  return (
    <svg
      className="person-portrait"
      viewBox="0 0 96 104"
      role="img"
      aria-label={`${personName(p)}'s portrait`}
    >
      <rect width="96" height="104" rx="24" fill="#e5ebd8" />
      <circle cx="74" cy="23" r="16" fill="#f6f3df" />
      {style === 4 && <circle cx="50" cy="15" r="12" fill={hair} />}
      {[2, 5].includes(style) && (
        <path d="M23 32 Q16 51 22 75 Q48 85 75 75 Q81 49 73 30Z" fill={hair} />
      )}
      <path d="M10 104 Q10 77 37 77 L59 77 Q86 77 86 104Z" fill={p.outfit} />
      <path d="M39 68 L39 81 Q48 90 57 81 L57 68Z" fill={p.skin} />
      <path
        d="M36 82 L48 92 L60 82"
        fill="none"
        stroke="#fff8e7"
        strokeWidth="3"
        opacity=".65"
      />
      <ellipse cx="24" cy="48" rx="6" ry="8" fill={p.skin} />
      <ellipse cx="72" cy="48" rx="6" ry="8" fill={p.skin} />
      <path
        d="M24 37 Q24 18 48 18 Q72 18 72 37 L70 55 Q67 76 48 77 Q29 76 26 55Z"
        fill={p.skin}
      />
      <path d={fringes[style]} fill={hair} />
      <g stroke={hair} strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M32 40 Q36 37 40 40" />
        <path d="M56 40 Q60 37 64 40" />
      </g>
      <g fill="#2b3731">
        <ellipse cx="36" cy="47" rx="3" ry="4" />
        <ellipse cx="60" cy="47" rx="3" ry="4" />
      </g>
      <g fill="#fff9e9">
        <circle cx="37" cy="46" r="1" />
        <circle cx="61" cy="46" r="1" />
      </g>
      <path
        d="M48 49 L46 56 L50 56"
        stroke="#8a503f"
        strokeOpacity=".35"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="#d77a71" opacity=".35">
        <ellipse cx="32" cy="56" rx="5" ry="3" />
        <ellipse cx="64" cy="56" rx="5" ry="3" />
      </g>
      <path
        d="M39 62 Q48 72 57 62"
        fill="#fff5df"
        stroke="#784b3c"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {p.id % 4 === 1 && (
        <g fill="#855a40" opacity=".45">
          <circle cx="31" cy="53" r="1" />
          <circle cx="35" cy="55" r="1" />
          <circle cx="63" cy="55" r="1" />
          <circle cx="67" cy="53" r="1" />
        </g>
      )}
    </svg>
  );
}
