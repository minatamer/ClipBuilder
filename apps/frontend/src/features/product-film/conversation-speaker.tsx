import { useId } from "react";

/** Twelve-second authored cycle: every movement closes at the film loop seam. */
export function conversationPose(frame: number, second: boolean) {
  const phase = ((frame % 360) + 360) % 360;
  const a = (phase / 360) * Math.PI * 2;
  const turn = (1 - Math.cos(a)) / 2;
  const speaking = second ? turn : 1 - turn;
  const offset = second ? 1.4 : 0;
  const blinkAt = second ? [83, 219, 328] : [46, 169, 281];
  const blink = Math.max(
    ...blinkAt.map((at) => Math.max(0, 1 - Math.abs(phase - at) / 3)),
  );
  return {
    breath: Math.sin(a * 2 + offset) * 2,
    lean: Math.sin(a + offset) * 1.1,
    nod: Math.sin(a * 3 + offset) * (0.5 + speaking),
    gesture: Math.sin(a * 2 + offset) * 5 * speaking,
    wrist: Math.sin(a * 3 + offset) * 4 * speaking,
    mouth: 1.1 + speaking * (1.8 + Math.pow(Math.sin(a * 18 + offset), 2) * 5),
    gaze: (second ? -1 : 1) * (1.8 + Math.sin(a) * 0.7),
    blink,
    brow: speaking * Math.sin(a * 4 + offset) * 1.1,
  };
}

/** Original rigged vector people; all motion is driven by the composition clock. */
export function ConversationSpeaker({
  frame,
  second = false,
}: {
  frame: number;
  second?: boolean;
}) {
  const id = useId();
  const p = conversationPose(frame, second);
  const skin = second ? "#c38e71" : "#e3b59a";
  const shade = second ? "#875a51" : "#b6816c";
  return (
    <g
      data-film-person={second ? "guest" : "host"}
      transform={`translate(${second ? 835 : 355} ${p.breath}) rotate(${p.lean} 0 730)`}
    >
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2=".3">
          <stop stopColor={shade} />
          <stop offset=".35" stopColor={skin} />
          <stop offset=".7" stopColor={skin} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
        <linearGradient id={`${id}-shirt`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={second ? "#b8c8df" : "#557bc1"} />
          <stop offset=".55" stopColor={second ? "#8da4c5" : "#375b9a"} />
          <stop offset="1" stopColor={second ? "#627a9e" : "#1d3863"} />
        </linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={second ? "#5c4944" : "#344357"} />
          <stop offset="1" stopColor={second ? "#251f28" : "#101b2b"} />
        </linearGradient>
      </defs>
      <path
        d="M-142 776Q-155 608-98 563L-53 538H52L102 564Q153 605 149 776Z"
        fill={`url(#${id}-shirt)`}
      />
      <path
        d="M-51 541L-41 469H40L53 541Q25 575 0 575Q-30 573-51 541"
        fill={`url(#${id}-skin)`}
      />
      <path
        d="M-42 483Q0 517 43 481L40 505Q5 534-45 519Z"
        fill={shade}
        opacity=".45"
      />
      {second ? (
        <>
          <path
            d="M-52 534-72 555-29 599 0 570 29 599 71 554 53 534 0 568Z"
            fill="#d1dbe9"
          />
          <path
            d="M0 574V774M-29 599-49 573M29 599 47 573"
            fill="none"
            stroke="#566e91"
            strokeWidth="2"
          />
          {[618, 674, 730].map((y) => (
            <circle key={y} cx="6" cy={y} r="2.6" fill="#e1e6ed" />
          ))}
          <path
            d="M37 640H87V691Q61 700 37 691Z"
            fill="none"
            stroke="#6b82a3"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path
            d="M-54 540Q-54 586 0 596Q53 587 55 541L69 550Q57 611 0 613Q-58 608-70 551Z"
            fill="#243d69"
          />
          <path
            d="M-50 558Q0 607 50 558"
            fill="none"
            stroke="#8da9d7"
            strokeWidth="2"
            opacity=".55"
          />
          <path
            d="M-66 565-42 671M64 565 43 671"
            stroke="#91a8c9"
            strokeWidth="3"
            opacity=".5"
          />
          <path d="M-47 675v12m92-12v12" stroke="#172b49" strokeWidth="5" />
        </>
      )}
      <path
        d="M-98 595-83 722M99 596 84 720M-50 731Q0 716 50 735M-110 754-74 741M77 739 121 754"
        fill="none"
        stroke={second ? "#5e779b" : "#233f70"}
        strokeWidth="3"
        opacity=".55"
      />
      <g transform={`rotate(${p.nod} 0 466)`}>
        <ellipse cx="-72" cy="423" rx="13" ry="23" fill={skin} />
        <ellipse cx="72" cy="423" rx="13" ry="23" fill={skin} />
        <path
          d="M-75 413Q-65 405-69 433M75 413Q65 405 69 433"
          fill="none"
          stroke={shade}
          strokeWidth="2"
        />
        <path
          d="M-71 384Q-69 324 0 325Q74 326 73 384L66 454Q59 488 23 506Q0 516-24 504Q-61 488-67 454Z"
          fill={`url(#${id}-skin)`}
        />
        <path
          d="M-61 421Q-49 446-27 446M61 421Q48 446 28 446"
          fill="none"
          stroke="#f0c8ac"
          strokeWidth="9"
          opacity=".13"
        />
        <path
          d={
            second
              ? "M-73 414Q-89 341-44 321Q-17 302 20 316Q79 311 80 385L66 418 55 373Q5 390-35 361L-62 390Z"
              : "M-74 415Q-87 347-55 328Q-36 307-8 318Q28 302 59 328Q85 341 75 394L62 416 54 371Q-4 383-50 361L-64 390Z"
          }
          fill={`url(#${id}-hair)`}
        />
        <path
          d="M-55 346Q-25 325 2 335M-33 353Q2 330 27 342M4 353Q31 338 53 353"
          fill="none"
          stroke={second ? "#92756a" : "#668199"}
          strokeWidth="2"
          opacity=".4"
        />
        <path
          d={`M-47 ${398 - p.brow}Q-30 ${389 - p.brow}-14 ${397 - p.brow}M15 ${397 + p.brow}Q31 ${390 + p.brow}46 ${398 + p.brow}`}
          fill="none"
          stroke={second ? "#4f3936" : "#2e3441"}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {[-31, 31].map((x) => (
          <g key={x}>
            <ellipse
              cx={x}
              cy="412"
              rx="14"
              ry={Math.max(0.4, 4.4 * (1 - p.blink))}
              fill="#e8ded3"
            />
            <ellipse
              cx={x + p.gaze}
              cy="412"
              rx="4.3"
              ry={Math.max(0.25, 4.1 * (1 - p.blink))}
              fill={second ? "#4c4c43" : "#4a5a65"}
            />
            <ellipse
              cx={x + p.gaze}
              cy="412"
              rx="2.1"
              ry={Math.max(0.2, 3.2 * (1 - p.blink))}
              fill="#18212b"
            />
            {!p.blink && (
              <circle cx={x + p.gaze + 1.2} cy="410.5" r="1.1" fill="white" />
            )}
            <path
              d={`M${x - 14} 412Q${x} ${405 + 6 * p.blink} ${x + 14} 412`}
              fill="none"
              stroke="#4e3d3b"
              strokeWidth="1.8"
            />
            <path
              d={`M${x - 12} 423Q${x} 428 ${x + 10} 423`}
              fill="none"
              stroke={shade}
              strokeWidth="1.2"
              opacity=".6"
            />
          </g>
        ))}
        <path
          d="M-2 413-7 439Q-9 446 1 446L9 442"
          fill="none"
          stroke={shade}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M-14 450Q-19 462-17 474M16 450Q21 462 18 474"
          fill="none"
          stroke={shade}
          strokeWidth="1.2"
          opacity=".55"
        />
        {!second && (
          <path
            d="M-59 452Q-44 485 0 491Q44 486 60 451L54 481Q30 514 0 514Q-33 512-56 480Z"
            fill="#43404a"
            opacity=".36"
          />
        )}
        <path
          d={`M-20 463Q-8 ${459 - p.mouth * 0.2} 0 461Q10 ${459 - p.mouth * 0.2} 21 463Q10 ${465 + p.mouth * 1.4} 0 ${465 + p.mouth * 1.3}Q-12 ${465 + p.mouth * 1.2}-20 463Z`}
          fill="#623b3f"
        />
        <path
          d={`M-13 463Q0 465 14 463L10 ${464 + Math.min(2, p.mouth * 0.2)}H-10Z`}
          fill="#e3d5c5"
          opacity={p.mouth > 3 ? 0.85 : 0}
        />
        <path
          d={`M-16 ${467 + p.mouth}Q0 ${474 + p.mouth * 0.5}16 ${467 + p.mouth}`}
          fill="none"
          stroke={shade}
          strokeWidth="1.4"
        />
        {!second && (
          <>
            <path
              d="M-79 385Q-88 301 0 301Q88 304 79 386"
              fill="none"
              stroke="#0b1527"
              strokeWidth="14"
            />
            <path
              d="M-78 375Q-86 309 0 309Q85 309 78 375"
              fill="none"
              stroke="#7389a7"
              strokeWidth="3"
            />
            {[-83, 83].map((x) => (
              <g key={x}>
                <rect
                  x={x - 10}
                  y="385"
                  width="20"
                  height="57"
                  rx="9"
                  fill="#101d31"
                />
                <rect
                  x={x - 7}
                  y="391"
                  width="7"
                  height="43"
                  rx="3"
                  fill="#415675"
                />
              </g>
            ))}
          </>
        )}
      </g>
      <g transform={`rotate(${p.gesture} -102 578)`}>
        <path
          d="M-97 564Q-145 573-166 646L-176 709Q-179 731-151 739L-94 737-79 696-126 687-110 634-60 592Z"
          fill={`url(#${id}-shirt)`}
        />
        <path
          d="M-160 672-126 686M-170 700-138 709"
          stroke={second ? "#526b8d" : "#1d3963"}
          strokeWidth="3"
          opacity=".6"
        />
        <g transform={`rotate(${p.wrist} -109 710)`}>
          <path
            d="M-111 695-82 685Q-68 675-56 679L-26 689Q-17 693-22 699L-56 692-18 705Q-9 710-16 715L-55 704-20 720Q-14 727-23 730L-60 715-35 732Q-31 740-40 741L-71 725Q-87 738-110 729Z"
            fill={`url(#${id}-skin)`}
          />
          <path
            d="M-92 707Q-80 704-69 711M-105 721-94 720"
            fill="none"
            stroke={shade}
            strokeWidth="1.7"
          />
        </g>
      </g>
      <path
        d="M97 565Q148 583 163 650L177 714Q178 735 148 745L92 735 76 697 126 686 108 638 64 594Z"
        fill={`url(#${id}-shirt)`}
      />
      <path
        d="M126 686 157 678M137 710 168 701"
        stroke={second ? "#526b8d" : "#1d3963"}
        strokeWidth="3"
        opacity=".6"
      />
      <path
        d="M94 699 62 691Q48 685 37 688L16 698Q9 704 17 708L48 700 23 716Q18 724 28 726L58 711 40 730Q37 737 45 739L73 718 62 738Q63 746 72 741L99 726Z"
        fill={`url(#${id}-skin)`}
      />
      <path
        d="M76 708Q66 706 59 714"
        stroke={shade}
        strokeWidth="1.5"
        fill="none"
      />
    </g>
  );
}
