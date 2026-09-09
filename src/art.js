export function icon(name, cls = "") {
  const paths = {
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    back: '<path d="m14 6-6 6 6 6"/>',
    star: '<path d="m12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.1-5.5-2.9L6.5 20l1.1-6.1-4.5-4.4 6.2-.9Z"/>',
    leaf: '<path d="M19 4C7 2 2 9 7 16S22 15 19 4Z"/><path d="m5 21 9-12"/>',
    sound:
      '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
    book: '<path d="M12 6C8 3 4 4 2 5v14c4-2 7-1 10 1 3-2 6-3 10-1V5c-2-1-6-2-10 1Zm0 0v14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    settings:
      '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
    flag: '<path d="M5 21V3c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/>',
    spark:
      '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
}
export function island(stage = 0, mini = false) {
  return `<svg class="island-art ${mini ? "mini-art" : ""}" viewBox="0 0 600 440" fill="none" aria-hidden="true">
    <ellipse cx="305" cy="398" rx="152" ry="17" fill="#dfe8d9" opacity=".55"/>
    <g class="cloud cloud-a" fill="#fffdf3"><path d="M42 102c-19-27 11-49 32-28 8-31 51-23 50 8 29-7 37 28 10 31H47c-14 0-17-8-5-11Z"/><path d="M454 67c-16-19 5-37 21-25 11-26 44-12 39 9 24-6 31 20 9 24h-65c-11 0-13-5-4-8Z"/></g>
    <g stroke="#55898a" stroke-width="2.5" stroke-linecap="round"><path d="m440 114 8-5 8 5m15 15 7-4 7 4M107 170l6-4 6 4"/></g>
    <g class="floating-island">
      <path d="m113 282 53 58 56 7 78 37 73-30 69-22 49-62-175-54Z" fill="#c79b76"/>
      <path d="m113 282 68 22 41 43 13-57 65 94 12-93 61 63 8-67 61 45 49-62-175-54Z" fill="#deb48c"/>
      <path d="m244 337 56 47 12-93-34 2Z" fill="#ae8265"/><path d="m391 312 12 22 26-13" fill="#ab805f"/>
      <ellipse cx="300" cy="267" rx="192" ry="65" fill="#6a9e67"/>
      <ellipse cx="300" cy="252" rx="192" ry="65" fill="#bbd894"/>
      <path d="M165 267c20-47 102-50 138-31s40 60 127 38" stroke="#e9dfb3" stroke-width="28" stroke-linecap="round"/>
      <path d="M253 204c-3 22-30 29-25 44 4 12 29 22 58 13 27-9 66-12 86-2" stroke="#d5e7a8" stroke-width="8" stroke-linecap="round"/>
      <path d="M220 229v-87" stroke="#796849" stroke-width="13" stroke-linecap="round"/>
      <path d="m220 182-29-24m30 42 25-27" stroke="#796849" stroke-width="7" stroke-linecap="round"/>
      <path d="M162 149c-24-19-1-49 14-51-8-39 47-67 70-36 34-8 64 26 48 52 32 28 7 70-25 66-19 21-48 17-58 0-25 13-49-2-49-31Z" fill="#4b8770"/>
      <path d="M176 110c-7-40 47-71 70-48 34-8 64 26 48 52-12-22-41-9-46-14-25-22-38 20-72 10Z" fill="#65a382"/>
      <path d="M168 150c26 17 37-13 59-8s16 27 41 13" stroke="#6ea78a" stroke-width="5" stroke-linecap="round"/>
      <path d="M397 239v-49" stroke="#7e7052" stroke-width="8" stroke-linecap="round"/><path d="m397 130-38 64h76Z" fill="#639b7b"/><path d="m397 109-31 62h62Z" fill="#81b390"/>
      <path d="M157 241v-28" stroke="#847452" stroke-width="5"/><path d="m157 168-28 53h56Z" fill="#84b08a"/>
      <g transform="translate(310 182)"><path d="M0 49V8l30-20L62 8v41Z" fill="#fbf1d5"/><path d="m-8 11 38-33L70 11" stroke="#d28465" stroke-width="12" stroke-linejoin="round"/><path d="M23 49V28c0-13 17-13 17 0v21" fill="#5e8274"/><rect x="8" y="20" width="9" height="12" rx="2" fill="#b7d6cf"/><path d="M49-8v-16h9v24" fill="#cb906d"/></g>
      <g transform="translate(266 240)"><ellipse cx="0" cy="20" rx="19" ry="6" fill="#95b77c"/><path d="M-14 8c-7-28 33-30 29-1l-2 14h-23Z" fill="#fffcdf"/><path d="M-6-11c-13-21 7-29 10-9 14-16 24-3 8 9" fill="#388878"/><circle cx="-5" cy="4" r="2" fill="#344b42"/><circle cx="7" cy="4" r="2" fill="#344b42"/><path d="M-2 10q3 4 6 0" stroke="#344b42" stroke-width="1.5" stroke-linecap="round"/><circle cx="-10" cy="9" r="3" fill="#eaae86"/><circle cx="12" cy="9" r="3" fill="#eaae86"/></g>
      <g fill="#fff7d7"><circle cx="193" cy="265" r="4"/><circle cx="184" cy="270" r="3"/><circle cx="425" cy="256" r="4"/><circle cx="440" cy="248" r="3"/></g>
      <g stroke="#769763" stroke-width="2" stroke-linecap="round"><path d="m209 284 2-6 3 6m153-66 2-6 3 6m-217 23 2-5 3 5m283 7 2-5 3 5"/></g>
      ${stage >= 1 ? '<g transform="translate(357 135)"><path d="m-9 60 5-48h13l6 48" fill="#faf1da"/><path d="m-7 12 8-14 11 14" fill="#ba795e"/><g stroke="#f9f4dd" stroke-width="6"><path d="m1 23-22-22m22 22 22 22m-22-22 22-22m-22 22-22 22"/></g><circle cx="1" cy="23" r="4" fill="#748376"/></g>' : ""}
      ${stage >= 2 ? '<ellipse cx="368" cy="278" rx="30" ry="11" fill="#7db9b6"/><path d="M350 276h20m-7 6h18" stroke="#d7f1e5" stroke-width="2" stroke-linecap="round"/>' : ""}
      ${stage >= 3 ? '<g fill="#edbd60"><path d="m185 206 3-7 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5Z"/><path d="m415 210 3-7 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5Z"/></g>' : ""}
      ${stage >= 4 ? '<g transform="translate(295 127)"><path d="M0 10q-15-9-25-3v27q14-5 25 3 12-8 25-3V7Q13 1 0 10Z" fill="#fff5db" stroke="#619486" stroke-width="3"/><path d="M0 10v27" stroke="#619486" stroke-width="2"/></g>' : ""}
      ${stage >= 5 ? '<path d="M128 167c-10-160 298-178 329 3" stroke="#e4b281" stroke-width="12" opacity=".6"/><path d="M140 167C139 27 416 17 445 170" stroke="#e9cf8b" stroke-width="10" opacity=".7"/>' : ""}
    </g>
    <g class="sparkles" fill="#e3ba65"><path d="m111 128 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z"/><path d="m459 202 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z"/><circle cx="346" cy="67" r="4"/></g>
  </svg>`;
}
