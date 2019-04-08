import { css } from 'styled-components';
export const container = css`
  width: 200%;
  height: 200%;
  transform-origin: 50% 50%;
  border-radius: 50%;
  transform: ${({ skew, polar, centralAngle }) => `skew(${-skew}deg) rotate(${((polar ? 90 : centralAngle) / 2) - 90}deg)`};
  color: black;
  background: ${({ backgroundColor, centerRadius }) => `radial-gradient(transparent ${centerRadius}, ${backgroundColor} ${centerRadius})`};
  outline: none;
  &:hover {
    color: white;
    background: radial-gradient(transparent ${({ centerRadius }) => `${centerRadius}, #424242 ${centerRadius}`});
  }
`;