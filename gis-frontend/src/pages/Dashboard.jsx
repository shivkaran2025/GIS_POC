import React, { useState } from "react";
import {
  FooterSection,
  DashboardWrapper,
  MainSection,
  MiddleSection,
  MiddleLeft,
  MiddleRight,
  MiddleCenter,
  ChartSection,
  Border,
  ProgressBarContainer,
  InformationContainer,
  InformationContent,
  Information,
  Text,
  InfoWrapper,
} from "./styles";
import Navbar from "../components/navbar/Navbar";
import File from "../assets/Action_Button_Compare_Country_Container.svg";
import Bell from "../assets/Bell.svg";
import Collapse from "../assets/collapse.svg";
import { viewSizeCalculator } from "../utils/viewSizeCalculator";
import Map from '../components/map/Map';

const Dashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCollapseClick = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <DashboardWrapper>
      <MainSection>
        <Navbar />
        <MiddleSection>
          <MiddleLeft isExpanded={isExpanded}>
            <img
              src={Collapse}
              style={{
                width: `${viewSizeCalculator(40, true)}`,
                height: `${viewSizeCalculator(40, true)}`,
              }}
              alt=""
              onClick={handleCollapseClick}
            />
            <img
              src={File}
              style={{
                width: `${viewSizeCalculator(40, true)}`,
                height: `${viewSizeCalculator(40, true)}`,
              }}
              alt=""
            />
            <img
              src={Bell}
              style={{
                width: `${viewSizeCalculator(40, true)}`,
                height: `${viewSizeCalculator(40, true)}`,
              }}
              alt=""
            />
          </MiddleLeft>

                  <MiddleCenter>
                      <Map/>
          </MiddleCenter>

          <MiddleRight>
            <h1
              style={{
                fontSize: `${viewSizeCalculator(16, true)}`,
                fontWeight: 700,
                color: "#333333",
              }}
            >
              On Air Sites
            </h1>

            <ChartSection></ChartSection>
            <Border />
            <ProgressBarContainer></ProgressBarContainer>
            <Border />
            <InfoWrapper>
              <InformationContainer>
                <InformationContent>
                  <Information>345</Information>
                  <Text>Sites with Poor Channel Quality</Text>
                </InformationContent>
                <InformationContent>
                  <Information>0.07 %</Information>
                  <Text>Average DCR</Text>
                </InformationContent>
              </InformationContainer>

              <InformationContainer>
                <InformationContent>
                  <Information>16.78</Information>
                  <Text>AVG SINR for Uplink PUSCH 5G</Text>
                </InformationContent>
                <InformationContent>
                  <Information>6.75</Information>
                  <Text>AVG SINR for Uplink PUSCH 4G</Text>
                </InformationContent>
              </InformationContainer>
            </InfoWrapper>
          </MiddleRight>
        </MiddleSection>
      </MainSection>
      <FooterSection>
        Developed by A.N.D. Access Network Development Group. For more
        information, please write to email
      </FooterSection>
    </DashboardWrapper>
  );
};

export default Dashboard;
