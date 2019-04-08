import { css } from 'styled-components';
export const container = css`
  cursor: ${({disabled}) => `${disabled ? 'default': 'pointer'}`};
  width: 200%;
  height: 200%;
  transform-origin: 50% 50%;
  border-radius: 50%;
  transform: ${({ skew, polar, centralAngle }) => `skew(${-skew}deg) rotate(${((polar ? 90 : centralAngle) / 2) - 90}deg)`};
  color: ${({disabled}) => disabled ? 'grey' : 'black'};
  background: ${({ backgroundColor, centerRadius }) => `radial-gradient(transparent ${centerRadius}, ${backgroundColor} ${centerRadius})`};
  outline: none;
  &:hover {
    color: ${({disabled}) => `${disabled ? 'grey' : 'white'}`};
    background: radial-gradient(transparent ${({ disabled, backgroundColor, centerRadius }) => `${centerRadius}, ${disabled ? backgroundColor : '#424242'} ${centerRadius}`});
  }
`;