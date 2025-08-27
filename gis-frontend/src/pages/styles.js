// import styled from "styled-components";
// import { viewSizeCalculator } from "../utils/viewSizeCalculator";

// export const DashboardWrapper = styled.div`
//   width: 100vw;
//   height: 100vh;
//   display: flex;
//   flex-direction: column;
//   overflow: hidden;
// `;

// export const MainSection = styled.div`
//   padding: ${viewSizeCalculator(16, true)} ${viewSizeCalculator(16, true)}
//     ${viewSizeCalculator(12, true)} ${viewSizeCalculator(12, true)};
//   background-color: #f7f7f7;
//   display: flex;
//   flex-direction: column;
// `;

// export const MiddleSection = styled.div`
//   margin-top: ${viewSizeCalculator(16, true)};
//   display: flex;
//   flex-direction: row;
//   justify-content:space-between;
//   gap:${viewSizeCalculator(15, true)};
// `;

// export const MiddleLeft = styled.div`
//   width: ${(props) =>
//     props.isExpanded
//       ? viewSizeCalculator(308, true)
//       : viewSizeCalculator(48, true)};
//   min-width: ${(props) =>
//     props.isExpanded
//       ? viewSizeCalculator(308, true)
//       : viewSizeCalculator(48, true)};

//   height: ${(props) =>
//     props.isExpanded
//       ? viewSizeCalculator(650, true)
//       : viewSizeCalculator(152, true)};
//   gap: ${(props) =>
//     props.isExpanded
//       ? viewSizeCalculator(15, true)
//       : viewSizeCalculator(12, true)};
//   border-radius: ${viewSizeCalculator(16, true)};
// box-sizing: border-box;
//   background-color: #ffffff;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   transition: all 0.3s ease-in-out;
//   overflow: hidden;
//   box-shadow: 1px 2px 8px 0px #1e1e1f1a;
// `;
// export const MiddleCenter = styled.div`
//   flex: 1;
//   border-radius: ${viewSizeCalculator(20, true)};
//   height: ${viewSizeCalculator(650, true)};
//   background-color: #ffffff;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   min-height: 400px;
//   overflow: hidden;
//   position: relative;
// `;
// export const MiddleRight = styled.div`
//   width: ${viewSizeCalculator(411, true)};
//   height: ${viewSizeCalculator(650, true)};
//   padding: ${viewSizeCalculator(24, true)};
//   gap: ${viewSizeCalculator(10, true)};
//   background-color: #ffffff;
//   box-shadow: 1px 2px 8px 0px #1e1e1f1a;
//   box-sizing: border-box;
//   border-radius: ${viewSizeCalculator(16, true)};
//   display: flex;
//   flex-direction: column;
// `;

// export const ChartSection = styled.div`
//   width: ${viewSizeCalculator(363, true)};
//   height: ${viewSizeCalculator(200, true)};
//   display:flex;
//   flex-direction:column;
//   align-items:center;
//   justify-content:center;
// `;

// export const Border = styled.div`
//   border: 0.89px solid #3333331a;
// `;

// export const ProgressBarContainer = styled.div`
//   width: 100%;
//   height: 100%;
// `;
// export const InformationContainer = styled.div`
//   width: ${viewSizeCalculator(360, true)};
//   height: ${viewSizeCalculator(96.5, true)};
//   display: flex;
//   flex-direction: row;
//   gap: ${viewSizeCalculator(60, true)};
// `;

// export const InformationContent = styled.div`
//   width: 100%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   text-align center;
//   gap: ${viewSizeCalculator(10, true)};
// `;

// export const InfoWrapper = styled.div`
//   width: ${viewSizeCalculator(360, true)};
//   height: ${viewSizeCalculator(203, true)};
//   display: flex;
//   flex-direction: column;
//   gap: ${viewSizeCalculator(5, true)};
// `;

// export const Text = styled.div`
//   font-weight: 500;
//   font-size: ${viewSizeCalculator(13, true)};
//   text-transform: uppercase;
//   color: #333333b2;
//   text-align: center;
// `;

// export const Information = styled.div`
//   font-weight: 700;
//   font-size: ${viewSizeCalculator(24, true)};
//   color: #333333;
// `;

// export const FooterSection = styled.div`
//   width: 100%;
//   font-size: ${viewSizeCalculator(8, true)};
//   font-weight ${viewSizeCalculator(400, true)};
//   background-color: #ffffff;
//   color: #333333B2;
//   display: flex;
//   flex-direction: column;
//   text-align: center;
// `;



import styled from "styled-components";
import { viewHeightCalculator, viewSizeCalculator } from "../../utils";

export const MiddleSection = styled.div`
  height:100%;
  width:100%;
  padding: ${viewSizeCalculator(16, true)};
  display: flex;
  flex-direction: row;
  justify-content:space-between;
  gap:${viewSizeCalculator(15, true)};
`;

export const MiddleCenter = styled.div`
  flex: 1;
  border-radius: ${viewSizeCalculator(20, true)};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  overflow: hidden;
  position: relative;
`;


export const MiddleRight = styled.div`
  width: ${viewSizeCalculator(412, true)};
  height: 100%;
  padding: ${viewSizeCalculator(20, true)};
  // gap: ${viewSizeCalculator(15, true)};
  background-color: #ffffff;
  box-shadow: 1px 2px 8px 0px #1e1e1f1a;
  box-sizing: border-box;
  border-radius: ${viewSizeCalculator(16, true)};
  display: flex;
  flex-direction: column;
  justify-content:space-between;
  `;
  
  export const ChartSection = styled.div`
  width: 100%;
`;

export const Border = styled.div`
  border: 0.89px solid #3333331a;
`;

// export const ProgressBarContainer = styled.div`
//   width: 100%;
//   height: ${viewHeightCalculator(70,true)};
//   `;

  export const InfoWrapper = styled.div`
  width: 100%;
  height: ${viewHeightCalculator(220, true)};
  margin-top:${viewSizeCalculator(5,true)};
  display: flex;
  flex-direction: column;
  gap: ${viewHeightCalculator(10, true)};
  `;
export const InformationContainer = styled.div`
  width: 100%;
  height: ${viewHeightCalculator(110, true)};
  display: flex;
  flex-direction: row;
  gap: ${viewSizeCalculator(60, true)};
`;

export const InformationContent = styled.div`
width: 100%;
max-height: ${viewHeightCalculator(100,true)};
display: flex;
flex-direction: column;
align-items: center;
text-align center;
`;


export const Text = styled.div`
  font-weight: 500;
  font-size: ${viewSizeCalculator(13, true)};
  color: #333333b2;
  text-align: center;
  text-wrap: balance;
`;

export const Information = styled.div`
  font-weight: 700;
  font-size: ${viewSizeCalculator(24, true)};
  color: #333333;
  `;

export const MiddleLeft = styled.div`
  width: ${(props) =>
    props.isExpanded
      ? viewSizeCalculator(308, true)
      : viewSizeCalculator(48, true)};
  height: ${(props) =>
    props.isExpanded
      ? "100%"
      : viewHeightCalculator(152, true)};
  
  gap: ${(props) =>
    props.isExpanded
      ? viewSizeCalculator(10, true)
      : "0"};
  
  padding: ${(props) =>
    props.isExpanded
      ? `${viewSizeCalculator(16, true)} ${viewSizeCalculator(24, true)}`
      : "0"};
  
  border-radius: ${viewSizeCalculator(16, true)};
  box-sizing: border-box;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;

  transition: 
    width 0.3s ease-in-out,
    height 0.3s ease-in-out,
    padding 0.3s ease-in-out,
    gap 0.3s ease-in-out;

  overflow: hidden;
  box-shadow: 1px 2px 8px 0px #1e1e1f1a;
`;

export const LeftIcons = styled.div`
  display: flex;
  flex-direction: ${(props) => (props.isExpanded ? "row" : "column")};
  align-items: center;
  gap: ${(props) =>
    props.isExpanded
      ? viewSizeCalculator(25, true)
      : viewSizeCalculator(10, true)};
  transition: flex-direction 0.3s ease-in-out, gap 0.3s ease-in-out;
`;

export const LeftDropDown = styled.div`
  width: ${viewSizeCalculator(260, true)};
  height: ${viewSizeCalculator(46, true)};
  padding: ${viewSizeCalculator(10, true)} ${viewSizeCalculator(20, true)};
  display: flex;
  flex-direction: row; 
  align-items: center;
  justify-content: space-between;
  border-radius: ${viewSizeCalculator(12, true)};
  border: solid ${viewSizeCalculator(1, true)} #dbdbdb;
  transition: all 0.3s ease-in-out;
`;

export const SiteIdSection = styled.div`
  width: 100%;
  margin-top: ${viewSizeCalculator(10, true)};
  padding-top: ${viewSizeCalculator(10, true)};
  display: flex;
  flex-direction: column;
  gap: ${viewSizeCalculator(20, true)};
  overflow-y: auto;
  transition: max-height 0.3s ease-in-out;

  &::-webkit-scrollbar {
    display: none;
  }
`;
