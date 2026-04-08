import { useState, useEffect, useRef } from "react";
import {
  Typography,
  Button,
  Alert,
  Tag,
  Progress,
  Input,
  Upload,
  Table,
  Tooltip,
  Tabs,
} from "antd";
import {
  ArrowLeftOutlined,
  FileExcelOutlined,
  CheckCircleFilled,
  EditOutlined,
  InboxOutlined,
  SaveOutlined,
  LoadingOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
  SwapOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// Larger mock census to make the review table feel real
const MOCK_CENSUS = [
  {
    key: "1",
    firstName: "John",
    lastName: "Smith",
    dob: "03/15/1985",
    gender: "M",
    zip: "90210",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE + Spouse",
    tobacco: "No",
  },
  {
    key: "2",
    firstName: "Sarah",
    lastName: "Smith",
    dob: "06/22/1987",
    gender: "F",
    zip: "90210",
    relationship: "Spouse",
    status: "Active",
    coverageLevel: "EE + Spouse",
    tobacco: "No",
  },
  {
    key: "3",
    firstName: "Michael",
    lastName: "Johnson",
    dob: "11/03/1990",
    gender: "M",
    zip: "90211",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE Only",
    tobacco: "Yes",
  },
  {
    key: "4",
    firstName: "Emily",
    lastName: "Johnson",
    dob: "09/14/1992",
    gender: "F",
    zip: "90211",
    relationship: "Spouse",
    status: "Active",
    coverageLevel: "EE + Family",
    tobacco: "No",
  },
  {
    key: "5",
    firstName: "David",
    lastName: "Williams",
    dob: "01/28/1978",
    gender: "M",
    zip: "90212",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE + Family",
    tobacco: "No",
  },
  {
    key: "6",
    firstName: "Lisa",
    lastName: "Brown",
    dob: "07/11/1995",
    gender: "F",
    zip: "90213",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE Only",
    tobacco: "No",
  },
  {
    key: "7",
    firstName: "James",
    lastName: "Davis",
    dob: "04/05/1982",
    gender: "M",
    zip: "90214",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE + Child(ren)",
    tobacco: "No",
  },
  {
    key: "8",
    firstName: "Anna",
    lastName: "Davis",
    dob: "12/19/1984",
    gender: "F",
    zip: "90214",
    relationship: "Spouse",
    status: "Active",
    coverageLevel: "EE + Child(ren)",
    tobacco: "No",
  },
  {
    key: "9",
    firstName: "Robert",
    lastName: "Miller",
    dob: "08/30/1988",
    gender: "M",
    zip: "90215",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE Only",
    tobacco: "Yes",
  },
  {
    key: "10",
    firstName: "Karen",
    lastName: "Wilson",
    dob: "05/17/1991",
    gender: "F",
    zip: "90216",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE + Spouse",
    tobacco: "No",
  },
  {
    key: "11",
    firstName: "Thomas",
    lastName: "Anderson",
    dob: "02/09/1975",
    gender: "M",
    zip: "90210",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE + Family",
    tobacco: "No",
  },
  {
    key: "12",
    firstName: "Patricia",
    lastName: "Anderson",
    dob: "08/16/1977",
    gender: "F",
    zip: "90210",
    relationship: "Spouse",
    status: "Active",
    coverageLevel: "EE + Family",
    tobacco: "No",
  },
  {
    key: "13",
    firstName: "Kevin",
    lastName: "Taylor",
    dob: "10/20/1993",
    gender: "M",
    zip: "90217",
    relationship: "Employee",
    status: "Waived",
    coverageLevel: "—",
    tobacco: "No",
  },
  {
    key: "14",
    firstName: "Jennifer",
    lastName: "Martinez",
    dob: "04/01/1989",
    gender: "F",
    zip: "90218",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE Only",
    tobacco: "No",
  },
  {
    key: "15",
    firstName: "Brian",
    lastName: "Garcia",
    dob: "12/12/1980",
    gender: "M",
    zip: "90219",
    relationship: "Employee",
    status: "Active",
    coverageLevel: "EE + Spouse",
    tobacco: "No",
  },
];

const PROCESSING_MESSAGES = [
  "Validating your census file structure...",
  "Checking for required fields...",
  "Validating member information...",
  "Checking for duplicate entries...",
  "Finalizing census processing...",
];

export default function CensusUploadPage({
  config,
  onNext,
  onBack,
  onSaveProgress,
  smallGroupMap,
}) {
  // Find carriers flagged as small group
  const sgCarriers = (config || []).flatMap((loc) =>
    (loc.carriers || [])
      .filter(
        (c) => c.selected && smallGroupMap?.[`${loc.key}.${c.key}`] === "yes",
      )
      .map((c) => ({
        locKey: loc.key,
        locLabel: loc.label,
        locHex: loc.hex,
        carrierKey: c.key,
        carrierName: c.name,
        effectiveDate: c.effectiveDate,
        id: `${loc.key}.${c.key}`,
      })),
  );

  // Group by effective date
  const dateGroups = sgCarriers.reduce((acc, c) => {
    const dateKey = c.effectiveDate?.format("MM/DD/YYYY") || "No Date";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(c);
    return acc;
  }, {});
  const dateKeys = Object.keys(dateGroups);

  // State per date group
  const [groupState, setGroupState] = useState(() =>
    Object.fromEntries(
      dateKeys.map((dk) => [
        dk,
        {
          npn: "",
          sic: "",
          zip: "",
          file: null,
          status: "idle",
          progress: 0,
          msgIndex: 0,
          censusData: [],
          errorMsg: null,
        },
      ]),
    ),
  );

  // Which date group is being reviewed (null = upload phase)
  const [reviewingGroup, setReviewingGroup] = useState(null);

  const timersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => clearInterval(t));
    };
  }, []);

  const updateGroup = (dateKey, patch) =>
    setGroupState((prev) => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], ...patch },
    }));

  const startProcessing = (dateKey) => {
    updateGroup(dateKey, {
      status: "validating",
      progress: 0,
      msgIndex: 0,
      errorMsg: null,
    });
    let progress = 0;
    let msgIdx = 0;
    const timer = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 40 && msgIdx < 1) msgIdx = 1;
      else if (progress >= 60) msgIdx = 2;
      else if (progress >= 75) msgIdx = 3;
      if (progress >= 90) msgIdx = 4;

      if (progress >= 100) {
        clearInterval(timer);
        delete timersRef.current[dateKey];
        setGroupState((prev) => ({
          ...prev,
          [dateKey]: {
            ...prev[dateKey],
            status: "success",
            progress: 100,
            msgIndex: 4,
            censusData: MOCK_CENSUS,
          },
        }));
        // Auto-open review after processing
        setReviewingGroup(dateKey);
      } else {
        setGroupState((prev) => ({
          ...prev,
          [dateKey]: {
            ...prev[dateKey],
            status: progress >= 40 ? "processing" : "validating",
            progress: Math.min(progress, 100),
            msgIndex: msgIdx,
          },
        }));
      }
    }, 800);
    timersRef.current[dateKey] = timer;
  };

  const handleFileUpload = (dateKey, file) => {
    updateGroup(dateKey, { file, status: "uploading" });
    setTimeout(() => startProcessing(dateKey), 600);
    return false;
  };

  const handleRemoveFile = (dateKey) => {
    if (timersRef.current[dateKey]) {
      clearInterval(timersRef.current[dateKey]);
      delete timersRef.current[dateKey];
    }
    updateGroup(dateKey, {
      file: null,
      status: "idle",
      progress: 0,
      msgIndex: 0,
      censusData: [],
      errorMsg: null,
    });
    if (reviewingGroup === dateKey) setReviewingGroup(null);
  };

  const allProcessed = Object.values(groupState).every(
    (g) => g.status === "success",
  );
  const anyProcessing = Object.values(groupState).some((g) =>
    ["uploading", "validating", "processing"].includes(g.status),
  );
  const allFieldsValid = Object.entries(groupState).every(
    ([, g]) => g.npn.length >= 8 && g.sic.length >= 4 && g.zip.length >= 5,
  );
  const canProceed = allProcessed && allFieldsValid;

  // ── Census review columns (full-width table) ──
  const censusColumns = [
    {
      title: "#",
      key: "index",
      width: 50,
      fixed: "left",
      render: (_, __, i) => (
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>{i + 1}</Text>
      ),
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      width: 120,
      fixed: "left",
      render: (v) => <Text style={{ fontWeight: 600 }}>{v}</Text>,
    },
    { title: "Last Name", dataIndex: "lastName", width: 120, fixed: "left" },
    { title: "Date of Birth", dataIndex: "dob", width: 110 },
    {
      title: "Gender",
      dataIndex: "gender",
      width: 80,
      render: (v) => (v === "M" ? "Male" : "Female"),
    },
    { title: "ZIP Code", dataIndex: "zip", width: 90 },
    {
      title: "Relationship",
      dataIndex: "relationship",
      width: 110,
      render: (v) => (
        <Tag
          style={{
            fontSize: 11,
            borderRadius: 4,
            margin: 0,
            color: v === "Employee" ? "#1a56db" : "#7e3af2",
            background: v === "Employee" ? "#eff6ff" : "#f5f3ff",
            borderColor: v === "Employee" ? "#bfdbfe" : "#ddd6fe",
          }}
        >
          {v}
        </Tag>
      ),
    },
    { title: "Coverage Level", dataIndex: "coverageLevel", width: 140 },
    {
      title: "Tobacco",
      dataIndex: "tobacco",
      width: 80,
      render: (v) => (
        <Tag
          color={v === "Yes" ? "orange" : "default"}
          style={{ fontSize: 11, borderRadius: 4, margin: 0 }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 90,
      render: (v) => (
        <Tag
          color={v === "Active" ? "green" : "default"}
          style={{ fontSize: 11, borderRadius: 4, margin: 0 }}
        >
          {v}
        </Tag>
      ),
    },
  ];

  // ── Step indicator (shared) ──
  const StepIndicator = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#1a2332",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircleFilled style={{ color: "#fff", fontSize: 13 }} />
        </div>
        <Text style={{ fontSize: 13, color: "#9ca3af" }}>
          Select LOCs & Dates
        </Text>
      </div>
      <div
        style={{
          flex: 1,
          height: 2,
          background: "#1a2332",
          margin: "-20px 8px 0",
          maxWidth: 120,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "3px solid #1a2332",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#1a2332",
            }}
          />
        </div>
        <Text strong style={{ fontSize: 13 }}>
          Census Upload
        </Text>
      </div>
      <div
        style={{
          flex: 1,
          height: 2,
          background: "#e5e7eb",
          margin: "-20px 8px 0",
          maxWidth: 120,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2px solid #d1d5db",
            background: "#f9fafb",
          }}
        />
        <Text style={{ fontSize: 13, color: "#9ca3af" }}>Confirm & Start</Text>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  //  REVIEW MODE — full-width census data table
  // ═══════════════════════════════════════════════════════════════════════════
  if (reviewingGroup) {
    const gs = groupState[reviewingGroup];
    const carriers = dateGroups[reviewingGroup] || [];
    const employeeCount = gs.censusData.filter(
      (r) => r.relationship === "Employee",
    ).length;
    const dependentCount = gs.censusData.length - employeeCount;
    const activeCount = gs.censusData.filter(
      (r) => r.status === "Active",
    ).length;
    const waivedCount = gs.censusData.filter(
      (r) => r.status === "Waived",
    ).length;

    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Step indicator */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 24 }}>
            Start New Renewal
          </Title>
          <StepIndicator />
        </div>

        {/* Back to upload view link */}
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => setReviewingGroup(null)}
          style={{
            color: "#1a56db",
            fontWeight: 500,
            padding: 0,
            marginBottom: 16,
          }}
        >
          Back to Census Upload
        </Button>

        {/* Review header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Title level={4} style={{ marginBottom: 4 }}>
              Census Data Review
            </Title>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Text style={{ fontSize: 13, color: "#6b7280" }}>
                Effective Date: {reviewingGroup}
              </Text>
              <span style={{ color: "#d1d5db" }}>|</span>
              {carriers.map((c) => (
                <Tag
                  key={c.id}
                  style={{
                    fontSize: 11,
                    borderRadius: 6,
                    color: "#1a56db",
                    borderColor: "#bfdbfe",
                    background: "#eff6ff",
                    margin: 0,
                  }}
                >
                  {c.carrierName}
                </Tag>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              icon={<DownloadOutlined />}
              size="small"
              style={{ fontSize: 12 }}
            >
              Download Original
            </Button>
            <Button
              icon={<SwapOutlined />}
              size="small"
              onClick={() => handleRemoveFile(reviewingGroup)}
              style={{ fontSize: 12 }}
            >
              Replace File
            </Button>
          </div>
        </div>

        {/* File info bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileExcelOutlined style={{ fontSize: 18, color: "#0e9f6e" }} />
            <Text style={{ fontWeight: 600, fontSize: 13, color: "#065f46" }}>
              {gs.file?.name || "census_data.xlsx"}
            </Text>
            <Tag
              color="success"
              style={{ fontSize: 11, borderRadius: 4, margin: 0 }}
            >
              Processed Successfully
            </Tag>
          </div>
          <Text style={{ fontSize: 12, color: "#059669" }}>
            {gs.censusData.length} total records
          </Text>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Employees", value: employeeCount, color: "#1a56db" },
            { label: "Dependents", value: dependentCount, color: "#7e3af2" },
            { label: "Active", value: activeCount, color: "#0e9f6e" },
            { label: "Waived", value: waivedCount, color: "#f97316" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "14px 16px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {s.label}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
                {s.value}
              </Text>
            </div>
          ))}
        </div>

        {/* Full-width census table */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {/* Table toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                Census Records
              </Text>
              <Tag
                style={{
                  fontSize: 11,
                  borderRadius: 6,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                {gs.censusData.length} rows
              </Tag>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Tooltip title="Inline editing available in full app">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  style={{ fontSize: 12 }}
                >
                  Edit Records
                </Button>
              </Tooltip>
            </div>
          </div>

          <Table
            dataSource={gs.censusData}
            columns={censusColumns}
            size="middle"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "25", "50"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} records`,
            }}
            scroll={{ x: 1000 }}
            rowClassName={(record) =>
              record.status === "Waived" ? "waived-row" : ""
            }
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
            gap: 12,
          }}
        >
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => setReviewingGroup(null)}
            style={{ color: "#1a56db", fontWeight: 500 }}
          >
            Back to Upload
          </Button>
          <div style={{ display: "flex", gap: 12 }}>
            {/* If there are more groups to process, go back to upload view */}
            {!allProcessed ? (
              <Button
                type="primary"
                size="large"
                onClick={() => setReviewingGroup(null)}
                style={{
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#1a2332",
                  borderColor: "#1a2332",
                  borderRadius: 8,
                }}
              >
                Continue Uploading
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                disabled={!canProceed}
                onClick={() => onNext?.()}
                style={{
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  background: canProceed ? "#1a2332" : undefined,
                  borderColor: canProceed ? "#1a2332" : undefined,
                  borderRadius: 8,
                }}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  UPLOAD MODE — compact cards per date group
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Step indicator */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <Title level={3} style={{ marginBottom: 24 }}>
          Start New Renewal
        </Title>
        <StepIndicator />
      </div>

      <Title level={4} style={{ marginBottom: 8 }}>
        Census Data for Small Group Carriers
      </Title>
      <Text
        type="secondary"
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          display: "block",
          marginBottom: 24,
        }}
      >
        Upload census files for carriers flagged as small group. Carriers
        sharing the same effective date use a single census file.
      </Text>

      {/* Per date-group cards */}
      {Object.entries(dateGroups).map(([dateKey, carriers]) => {
        const gs = groupState[dateKey] || {};
        const isProcessing = ["uploading", "validating", "processing"].includes(
          gs.status,
        );

        return (
          <div
            key={dateKey}
            style={{
              border:
                gs.status === "success"
                  ? "1.5px solid #bbf7d0"
                  : "1.5px solid #e5e7eb",
              borderRadius: 12,
              background: "#fff",
              marginBottom: 20,
              overflow: "hidden",
            }}
          >
            {/* Group header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: gs.status === "success" ? "#f0fdf4" : "#f8faff",
                borderBottom:
                  "1px solid " +
                  (gs.status === "success" ? "#bbf7d0" : "#e5e7eb"),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <MedicineBoxOutlined
                  style={{
                    fontSize: 16,
                    color: gs.status === "success" ? "#0e9f6e" : "#1a56db",
                  }}
                />
                <div>
                  <Text style={{ fontWeight: 700, fontSize: 15 }}>
                    Effective Date: {dateKey}
                  </Text>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {carriers.map((c) => (
                      <Tag
                        key={c.id}
                        style={{
                          fontSize: 11,
                          borderRadius: 6,
                          color: "#1a56db",
                          borderColor: "#bfdbfe",
                          background: "#eff6ff",
                        }}
                      >
                        {c.carrierName}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
              {gs.status === "success" && (
                <Tag
                  icon={<CheckCircleFilled />}
                  color="success"
                  style={{ borderRadius: 8, fontSize: 12 }}
                >
                  {gs.censusData.length} members
                </Tag>
              )}
            </div>

            <div style={{ padding: "20px" }}>
              {/* NPN / SIC / ZIP fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    NPN *
                  </Text>
                  <Input
                    placeholder="12345678"
                    value={gs.npn}
                    onChange={(e) =>
                      updateGroup(dateKey, {
                        npn: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    maxLength={10}
                    disabled={gs.status === "success"}
                    status={gs.npn && gs.npn.length < 8 ? "error" : undefined}
                  />
                  {gs.npn && gs.npn.length < 8 && (
                    <Text style={{ fontSize: 11, color: "#ef4444" }}>
                      Must be at least 8 digits
                    </Text>
                  )}
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    SIC Code *
                  </Text>
                  <Input
                    placeholder="1234"
                    value={gs.sic}
                    onChange={(e) =>
                      updateGroup(dateKey, {
                        sic: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    maxLength={4}
                    disabled={gs.status === "success"}
                    status={gs.sic && gs.sic.length < 4 ? "error" : undefined}
                  />
                  {gs.sic && gs.sic.length < 4 && (
                    <Text style={{ fontSize: 11, color: "#ef4444" }}>
                      Must be 4 digits
                    </Text>
                  )}
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    ZIP Code *
                  </Text>
                  <Input
                    placeholder="90210"
                    value={gs.zip}
                    onChange={(e) =>
                      updateGroup(dateKey, {
                        zip: e.target.value.replace(/\D/g, "").slice(0, 5),
                      })
                    }
                    maxLength={5}
                    disabled={gs.status === "success"}
                    status={gs.zip && gs.zip.length < 5 ? "error" : undefined}
                  />
                  {gs.zip && gs.zip.length < 5 && (
                    <Text style={{ fontSize: 11, color: "#ef4444" }}>
                      Must be 5 digits
                    </Text>
                  )}
                </div>
              </div>

              {/* File upload area */}
              {gs.status === "idle" && (
                <Dragger
                  accept=".csv,.xlsx,.xls,.xlsm"
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => handleFileUpload(dateKey, file)}
                  style={{
                    borderRadius: 10,
                    border: "2px dashed #d1d5db",
                    background: "#fafbfc",
                    padding: "20px 0",
                  }}
                >
                  <p style={{ marginBottom: 8 }}>
                    <InboxOutlined style={{ fontSize: 36, color: "#1a56db" }} />
                  </p>
                  <p
                    style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}
                  >
                    Drag & drop census file or click to browse
                  </p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>
                    Supports CSV, Excel (.xlsx, .xls, .xlsm) — Max 10MB
                  </p>
                </Dragger>
              )}

              {/* Processing state */}
              {isProcessing && (
                <div
                  style={{
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    background: "#f0f5ff",
                    padding: "24px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <LoadingOutlined
                      style={{ fontSize: 18, color: "#1a56db" }}
                      spin
                    />
                    <div>
                      <Text
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#1e3a6e",
                          display: "block",
                        }}
                      >
                        Processing Census
                      </Text>
                      <Text style={{ fontSize: 12, color: "#4b72b8" }}>
                        {gs.file?.name}
                      </Text>
                    </div>
                  </div>
                  <Progress
                    percent={Math.round(gs.progress)}
                    strokeColor="#1a56db"
                    trailColor="#dbeafe"
                    showInfo={false}
                    style={{ marginBottom: 12 }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      background: "#fff",
                      borderRadius: 6,
                      border: "1px solid #dbeafe",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#1a56db",
                      }}
                    />
                    <Text style={{ fontSize: 12, color: "#4b72b8" }}>
                      {PROCESSING_MESSAGES[gs.msgIndex] ||
                        PROCESSING_MESSAGES[0]}
                    </Text>
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      icon={<SaveOutlined />}
                      onClick={() => onSaveProgress?.()}
                      style={{
                        fontSize: 13,
                        color: "#1a56db",
                        borderColor: "#bfdbfe",
                      }}
                    >
                      Save Progress & Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Error state */}
              {gs.status === "error" && (
                <Alert
                  type="error"
                  showIcon
                  style={{ borderRadius: 8 }}
                  message="Census processing failed"
                  description={
                    gs.errorMsg ||
                    "There was an issue processing your census file. Please try again."
                  }
                  action={
                    <Button
                      size="small"
                      onClick={() => handleRemoveFile(dateKey)}
                    >
                      Re-upload
                    </Button>
                  }
                />
              )}

              {/* Success — compact summary with "Review Data" button */}
              {gs.status === "success" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <FileExcelOutlined
                      style={{ fontSize: 20, color: "#0e9f6e" }}
                    />
                    <div>
                      <Text
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: "#065f46",
                          display: "block",
                        }}
                      >
                        {gs.file?.name || "census_data.xlsx"}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#059669" }}>
                        {
                          gs.censusData.filter(
                            (r) => r.relationship === "Employee",
                          ).length
                        }{" "}
                        employees,{" "}
                        {
                          gs.censusData.filter(
                            (r) => r.relationship !== "Employee",
                          ).length
                        }{" "}
                        dependents
                      </Text>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => handleRemoveFile(dateKey)}
                      style={{ color: "#6b7280", fontSize: 12 }}
                    >
                      Replace
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => setReviewingGroup(dateKey)}
                      style={{
                        fontSize: 12,
                        background: "#1a56db",
                        borderRadius: 6,
                      }}
                    >
                      Review Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "center",
          marginTop: 24,
        }}
      >
        {!canProceed && !anyProcessing && (
          <Alert
            style={{ width: "100%", borderRadius: 8 }}
            type="info"
            showIcon
            message="Upload and process census files for all small group carrier groups to proceed."
          />
        )}
        <Button
          type="primary"
          size="large"
          disabled={!canProceed}
          onClick={() => onNext?.()}
          style={{
            width: "100%",
            height: 48,
            fontSize: 15,
            fontWeight: 600,
            background: canProceed ? "#1a2332" : undefined,
            borderColor: canProceed ? "#1a2332" : undefined,
            borderRadius: 8,
          }}
        >
          Next
        </Button>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ color: "#1a56db", fontWeight: 500 }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
