import styled from "styled-components";
import { viewSizeCalculator } from "../../utils/viewSizeCalculator";

export const NavWrapper = styled.div`
  height: ${viewSizeCalculator(64, true)};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const NavLeft = styled.div`
  width: ${viewSizeCalculator(190, true)};
  height: ${viewSizeCalculator(64, true)};
  border-radius: ${viewSizeCalculator(16, true)};
  //   padding: ${viewSizeCalculator(12, true)} ${viewSizeCalculator(12, true)}
  //     ${viewSizeCalculator(12, true)} ${viewSizeCalculator(24, true)};
  background-color: #ffffff;
  box-shadow: 0px 1px 5px 0px #1e1e1f1a;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${viewSizeCalculator(10, true)};
`;
export const NavCenter = styled.div`
  width: ${viewSizeCalculator(971, true)};
  height: ${viewSizeCalculator(64, true)};
  padding: ${viewSizeCalculator(0, true)} ${viewSizeCalculator(12, true)}
    ${viewSizeCalculator(0, true)} ${viewSizeCalculator(12, true)};
  border-radius: ${viewSizeCalculator(16, true)};
  background-color: #ffffff;
  box-shadow: 0px 1px 5px 0px #1e1e1f1a;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Text = styled.div`
  font-weight: ${({ fontWeight }) => fontWeight || 600};
  font-style: ${({ fontStyle }) => fontStyle || "normal"};
  font-size: ${({ fontSize }) =>
    fontSize
      ? viewSizeCalculator(fontSize, true)
      : viewSizeCalculator(20, true)};
  color: #1e1e1f;
`;

export const DateWrappwer = styled.div`
  width: ${viewSizeCalculator(200, true)};
  height: ${viewSizeCalculator(48, true)};
  angle: 0 deg;
  opacity: 1;
  border-radius: ${viewSizeCalculator(12, true)};
  padding: ${viewSizeCalculator(0, true)} ${viewSizeCalculator(16, true)};
  border: ${viewSizeCalculator(1, true)} solid #ebebeb;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const NavRight = styled.div`
  width: ${viewSizeCalculator(224, true)};
  height: ${viewSizeCalculator(64, true)};
  //   padding: ${viewSizeCalculator(12, true)} ${viewSizeCalculator(16, true)}
  //     ${viewSizeCalculator(12, true)} ${viewSizeCalculator(12, true)};
  background-color: #ffffff;
  border-radius: ${viewSizeCalculator(16, true)};
  box-shadow: 0px 1px 5px 0px #1e1e1f1a;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${viewSizeCalculator(10, true)};
`;
