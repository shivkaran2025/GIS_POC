import React from "react";
import {
  DateWrappwer,
  NavCenter,
  NavLeft,
  NavRight,
  NavWrapper,
  Text,
} from "./styles";
import PlayPaush from "../../assets/Frame 1618873229.svg";
import AddFile from "../../assets/Frame 1618873227.svg";
import Frame from "../../assets/Frame 1618872962.svg";
import ProfilePicture from "../../assets/Mask group.svg";
import Logo from "../../assets/Group 1437254109.svg";
import BarIcon from "../../assets/Action_Button_ CountryList_Container.svg";
import Calender from "../../assets/fluent_calendar-28-regular.svg";
import { viewSizeCalculator } from "../../utils/viewSizeCalculator";

const Navbar = () => {
  return (
    <NavWrapper>
      <NavLeft>
        <img
          src={Logo}
          style={{
            width: `${viewSizeCalculator(100, true)}`,
            height: `${viewSizeCalculator(25, true)}`,
          }}
          alt=""
        />
        <img
          src={BarIcon}
          style={{
            width: `${viewSizeCalculator(40, true)}`,
            height: `${viewSizeCalculator(40, true)}`,
          }}
          alt=""
        />
      </NavLeft>
      <NavCenter>
        <Text fontWeight={500} fontStyle="medium" fontSize={20}>
          GIS Mapping
        </Text>
        <DateWrappwer>
          <Text fontWeight={600} fontStyle="semibold" fontSize={14}>
            July'25
          </Text>
          <img
            src={Calender}
            style={{
              width: `${viewSizeCalculator(24, true)}`,
              height: `${viewSizeCalculator(24, true)}`,
            }}
            alt=""
          />
        </DateWrappwer>
      </NavCenter>
      <NavRight>
        <img
          src={PlayPaush}
          style={{
            width: `${viewSizeCalculator(40, true)}`,
            height: `${viewSizeCalculator(40, true)}`,
          }}
          alt=""
        />
        <img
          src={Frame}
          style={{
            width: `${viewSizeCalculator(40, true)}`,
            height: `${viewSizeCalculator(40, true)}`,
          }}
          alt=""
        />
        <img
          src={AddFile}
          style={{
            width: `${viewSizeCalculator(40, true)}`,
            height: `${viewSizeCalculator(40, true)}`,
          }}
          alt=""
        />
        <img
          src={ProfilePicture}
          style={{
            width: `${viewSizeCalculator(40, true)}`,
            height: `${viewSizeCalculator(40, true)}`,
          }}
          alt=""
        />
      </NavRight>
    </NavWrapper>
  );
};

export default Navbar;
