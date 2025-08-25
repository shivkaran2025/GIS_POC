import React, { useState, useEffect } from "react";
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
import BarChart from "../assets/BarChart.svg";
import Collapse from "../assets/collapse.svg";
import { viewSizeCalculator } from "../utils/viewSizeCalculator";
import { EnhancedMap } from "../components/map_enhanced";
import {
  getMarketKpiByMarketId,
  getZipKpiByZipId,
  getNeighborhoodKpiByNeighborhoodId,
  // getHexKpiByHexId,
  getSiteKpiBySiteId,
} from "../services/kpiApiService";
import {
  getCountMarketById,
  getCountNeighborhoodById,
  getCountZipById,
} from "../services/countKpiApiService";
import AnimatedCounter from "../components/counter/AnimatedCounter";
import PieChart from "../components/charts/PieChart";

const Dashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [avgDcr, setAvgDcr] = useState(0.07);
  const [sitePoorChnlQlty, setSitePoorChnlQlty] = useState(345);
  const [avgSINR5G, setAvgSINR5G] = useState(16.78);
  const [avgSINR4G, setAvgSINR4G] = useState(6.75);
  const [isData, setIsData] = useState("success");
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [totalSites, setTotalSites] = useState(82723);
  console.log("siteid", selectedSiteId);

  useEffect(() => {
    if (selectedSiteId) {
      const fetchSiteKpi = async () => {
        try {
          const response = await getSiteKpiBySiteId(selectedSiteId);
          console.log("Site KPI:", response);

          if (response?.data?.length > 0) {
            const first = response.data[0];

            setAvgDcr(first.ret_volte_drop_rate_4g || 0);
            setSitePoorChnlQlty(first.qual_avg_cqi_4g || 0);
            setAvgSINR5G(first.qual_ue_avg_sinr_pusch_5g || 0);
            setAvgSINR4G(first.qual_ue_avg_sinr_pusch_4g || 0);
          }
        } catch (err) {
          console.error("Error fetching Site KPI:", err);
          setIsData("error");
        }
      };

      fetchSiteKpi();
    }
  }, [selectedSiteId]);

  const handleMarketSelect = async (marketId) => {
    try {
      setIsData("success");
      const response = await getMarketKpiByMarketId(marketId);
      console.log("Market KPI:", response);
      //  here you can also update state if you want to display the KPIs
      if (response?.data?.length > 0) {
        const first = response.data[0];

        // set states using API values
        setAvgDcr(first.ret_volte_drop_rate_4g); // DCR
        setSitePoorChnlQlty(first.qual_avg_cqi_4g); // Poor Channel Quality
        setAvgSINR5G(first.qual_ue_avg_sinr_pusch_5g); // SINR 5G
        setAvgSINR4G(first.qual_ue_avg_sinr_pusch_4g); // SINR 4G
      }
      const countData = await getCountMarketById(marketId);
      const siteCount = countData.data[0]["COUNT(market_id)"];
      setTotalSites(siteCount);
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
      const countData = await getCountNeighborhoodById(neighborhoodId);
      // const countData = await getCountNeighborhoodById('BG530330279012');
      const siteCount = countData.data[0]["COUNT(neighborhood_id)"];
      setTotalSites(siteCount);
    } catch (error) {
      console.error("Error fetching Neighborhood KPI:", error);
    }
  };

  const handleZipSelect = async (zipCode) => {
    try {
      const response = await getZipKpiByZipId(zipCode);
      if (response?.data?.length > 0) {
        const first = response.data[0];
        setAvgDcr(first.ret_volte_drop_rate_4g);
        setSitePoorChnlQlty(first.qual_avg_cqi_4g);
        setAvgSINR5G(first.qual_ue_avg_sinr_pusch_5g);
        setAvgSINR4G(first.qual_ue_avg_sinr_pusch_4g);
      }
      const countData = await getCountZipById(zipCode);
      // const countData = await getCountZipById(98148);
      const zipCount = countData.data[0]["COUNT(zip_code)"];
      setTotalSites(zipCount);
    } catch (error) {
      console.error("Error fetching ZIP KPI:", error);
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
      } else if (
        view === "NEIGHBORHOOD" &&
        context.neighborhoodIds?.length > 0
      ) {
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

  const handleGlobeClick = () => {
    setAvgDcr(0.07);
    setSitePoorChnlQlty(345);
    setAvgSINR5G(16.78);
    setAvgSINR4G(6.75);
    setTotalSites(82723);

    // Reset map view KPIs via handleViewChange
    handleViewChange("NATIONAL", {});
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
              setSelectedSiteId={setSelectedSiteId}
              onGlobeClick={handleGlobeClick}
              onZipSelect={handleZipSelect}
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
              {/* <PieChart /> */}
              <PieChart
                centerContent={
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: viewSizeCalculator(15, true),
                        fontWeight: 700,
                        color: "#333",
                        lineHeight: 1.1,
                      }}
                    >
                      <AnimatedCounter target={totalSites} duration={800} />
                    </div>
                    <div
                      style={{
                        fontSize: viewSizeCalculator(12, true),
                        fontWeight: 400,
                        color: "#888",
                      }}
                    >
                      Total Sites
                    </div>
                  </div>
                }
              />
            </ChartSection>
            <Border />
            <ProgressBarContainer>
              <img
                src={BarChart}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                alt=""
                onClick={handleCollapseClick}
              />
            </ProgressBarContainer>
            <Border />
            {isData === "success" ? (
              <InfoWrapper>
                <InformationContainer>
                  <InformationContent>
                    <Information>
                      <AnimatedCounter
                        target={sitePoorChnlQlty}
                        duration={800}
                      />
                    </Information>
                    <Text>Sites with Poor Channel Quality</Text>
                  </InformationContent>
                  <InformationContent>
                    <Information>
                      <AnimatedCounter
                        target={avgDcr}
                        duration={800}
                        decimals={2}
                      />
                      %
                    </Information>
                    <Text>Average DCR</Text>
                  </InformationContent>
                </InformationContainer>

                <InformationContainer>
                  <InformationContent>
                    <Information>
                      <AnimatedCounter
                        target={avgSINR5G}
                        duration={800}
                        decimals={2}
                      />
                    </Information>
                    <Text>AVG SINR for Uplink PUSCH 5G</Text>
                  </InformationContent>
                  <InformationContent>
                    <Information>
                      <AnimatedCounter
                        target={avgSINR4G}
                        duration={800}
                        decimals={2}
                      />
                    </Information>
                    <Text>AVG SINR for Uplink PUSCH 4G</Text>
                  </InformationContent>
                </InformationContainer>
              </InfoWrapper>
            ) : (
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "400",
                  color: "#e20074",
                  textAlign: "center",
                }}
              >
                No Data Available
              </p>
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
