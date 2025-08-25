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
import { EnhancedMap } from "../components/map_enhanced";
import {
  getMarketKpiByMarketId,
  getZipKpiByZipId,
  getNeighborhoodKpiByNeighborhoodId,
  getHexKpiByHexId,
  getSiteKpiBySiteId,
} from "../services/kpiApiService";

const Dashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [avgDcr, setAvgDcr] = useState(0.07);
  const [sitePoorChnlQlty, setSitePoorChnlQlty] = useState(345);
  const [avgSINR5G, setAvgSINR5G] = useState(16.78);
  const [avgSINR4G, setAvgSINR4G] = useState(6.75);
  const [isData, setIsData] = useState("success");
  const [market, setMarket] = useState("National");

  const handleMarketSelect = async (marketId) => {
    setMarket(marketId);
    try {
      setIsData("success");
      const response = await getMarketKpiByMarketId(marketId);
      console.log("Market KPI:", response);
      // 🔥 here you can also update state if you want to display the KPIs
      if (response?.data?.length > 0) {
        const first = response.data[0];

        // 🔥 set states using API values
        setAvgDcr(first.ret_volte_drop_rate_4g); // DCR
        setSitePoorChnlQlty(first.qual_avg_cqi_4g); // Poor Channel Quality
        setAvgSINR5G(first.qual_ue_avg_sinr_pusch_5g); // SINR 5G
        setAvgSINR4G(first.qual_ue_avg_sinr_pusch_4g); // SINR 4G
      }
    } catch (error) {
      setIsData("error");
      console.error("Error fetching KPI:", error);
    }
  };

  const handleNeighborhoodSelect = async (neighborhoodId) => {
    try {
      const response = await getNeighborhoodKpiByNeighborhoodId(neighborhoodId);
      console.log("Neighborhood KPI:", response);

      if (response?.data?.length > 0) {
        const first = response.data[0];

        setAvgDcr(first.ret_volte_drop_rate_4g);
        setSitePoorChnlQlty(first.qual_avg_cqi_4g);
        setAvgSINR5G(first.qual_ue_avg_sinr_pusch_5g);
        setAvgSINR4G(first.qual_ue_avg_sinr_pusch_4g);
      }
    } catch (error) {
      console.error("Error fetching Neighborhood KPI:", error);
    }
  };

  const handleCollapseClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleViewChange = async (view, context) => {
    console.log("Map View Changed:", view, context);

    try {
      if (view === "MARKET" && context.marketId) {
        await handleMarketSelect(context.marketId);
      } else if (view === "NEIGHBORHOOD" && context.neighborhoodIds?.length > 0) {
        await handleNeighborhoodSelect(context.neighborhoodIds[0]);
      } else if (view === "NATIONAL") {
        // reset to some default or clear KPIs
        setAvgDcr(0.07);
        setSitePoorChnlQlty(345);
        setAvgSINR5G(16.78);
        setAvgSINR4G(6.75);
      }
    } catch (error) {
      console.error("Error in handleViewChange:", error);
    }
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
            <EnhancedMap
              onMarketSelect={handleMarketSelect}
              onNeighborhoodSelect={handleNeighborhoodSelect}
              onViewChange={handleViewChange}
            />
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

            <ChartSection>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#e20074",
                }}
              >
                {market}
              </div>
              <div style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#000000",
              }}>Market
              </div>
            </ChartSection>
            <Border />
            <ProgressBarContainer></ProgressBarContainer>
            <Border />
            {isData === "success" ? (
              <InfoWrapper>
                <InformationContainer>
                  <InformationContent>
                    <Information>{sitePoorChnlQlty.toFixed(2)}</Information>
                    <Text>Sites with Poor Channel Quality</Text>
                  </InformationContent>
                  <InformationContent>
                    <Information>{avgDcr.toFixed(2)}%</Information>
                    <Text>Average DCR</Text>
                  </InformationContent>
                </InformationContainer>

                <InformationContainer>
                  <InformationContent>
                    <Information>{avgSINR5G.toFixed(2)}</Information>
                    <Text>AVG SINR for Uplink PUSCH 5G</Text>
                  </InformationContent>
                  <InformationContent>
                    <Information>{avgSINR4G.toFixed(2)}</Information>
                    <Text>AVG SINR for Uplink PUSCH 4G</Text>
                  </InformationContent>
                </InformationContainer>
              </InfoWrapper>
            ) : (
              <p style={{
                  fontSize: "20px",
                  fontWeight: "400",
                  color: "#e20074",
                  textAlign:"center",
                }}>No Data Available</p>
            )}
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
