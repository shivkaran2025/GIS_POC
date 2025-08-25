// import React from "react";
// import {
//   Pie,
//   PieChart as RePieChart,
//   ResponsiveContainer,
//   Cell,
//   Legend,
// } from "recharts";
// import { viewSizeCalculator } from "../../utils/viewSizeCalculator";

// const data = [
//   { name: "5G", value: 75, color: "#e20074" },
//   { name: "LTE", value: 20, color: "#368975" },
//   { name: "Unknown", value: 5, color: "#999999ff" },
// ];

// const PieChart = () => {
//   return (
//     <div style={{ width: "100%", height: `${viewSizeCalculator(400, true)}` }}>
//       <ResponsiveContainer>
//         <RePieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="50%"
//             innerRadius={60}
//             outerRadius={80}
//             dataKey="value"
//             paddingAngle={3}
//             cornerRadius={5}
//           >
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Legend
//             verticalAlign="bottom"
//             align="center"
//             iconType="circle"
//             wrapperStyle={{ marginTop: 20 }}
//           />
//         </RePieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default PieChart;






import React from "react";
import {
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { viewSizeCalculator } from "../../utils/viewSizeCalculator";

const data = [
  { name: "5G", value: 75, color: "#e20074" },
  { name: "LTE", value: 20, color: "#368975" },
  { name: "Unknown", value: 5, color: "#999999ff" },
];

// Accept centerContent as children or prop
const PieChart = ({ centerContent }) => {
  return (
    <div
      style={{
        width: "100%",
        height: viewSizeCalculator(400, true),
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ResponsiveContainer>
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            paddingAngle={3}
            cornerRadius={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ marginTop: 20 }}
          />
        </RePieChart>
      </ResponsiveContainer>
      {/* Centered content overlaid absolutely */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        {centerContent}
      </div>
    </div>
  );
};

export default PieChart;
