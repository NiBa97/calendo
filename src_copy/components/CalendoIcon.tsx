import { Icon, IconProps } from "@chakra-ui/react";

const CalendoIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="15" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="9" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="15" cy="14" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  </Icon>
);

export default CalendoIcon;