import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import axios from "axios";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7f7f",
  "#8dd1e1",
  "#d084d0",
];

const StatsReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:5000/admin/stats");
        const monthlyRes = await fetch(
          "http://localhost:5000/admin/monthly-stats"
        );

        if (!res.ok || !monthlyRes.ok) {
          throw new Error("Erreur de chargement des statistiques");
        }

        const statsData = await res.json();
        const monthlyData = await monthlyRes.json();

        setStats(statsData);
        setMonthlyStats(monthlyData); // ✅ <-- this was missing
      } catch (err) {
        console.error("Erreur de chargement des statistiques:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // PDF Export Handler
  const handleExportPDF = (stats, monthlyStats) => {
    if (!stats || !monthlyStats) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Rapport Administratif - Statistiques", 14, 20);

    // SECTION 1 - Global Summary
    doc.setFontSize(14);
    doc.text("Général", 14, 32);

    const globalStats = [
      ["Nombre total d'utilisateurs", stats.users || 0],
      ["Total des réservations", stats.reservations || 0],
      ["Revenus générés (€)", stats.payments?.toFixed(2) || 0],
      ["Abonnements actifs", stats.abonnements || 0],
    ];

    autoTable(doc, {
      head: [["Statistique", "Valeur"]],
      body: globalStats,
      startY: 38,
      theme: "grid",
      styles: { fontSize: 11 },
      headStyles: { fillColor: [46, 74, 204] },
    });

    // ✔ Safely calculate next Y position
    let nextY = (doc.lastAutoTable?.finalY || 50) + 14;

    doc.setFontSize(14);
    doc.text("Mensuel", 14, nextY);

    doc.setFontSize(14);
    doc.text("Mensuel", 14, nextY);

    const months = {};
    // Collect all unique months and match stats by month
    monthlyStats.paiements.forEach((p) => {
      const m = new Date(p.dataValues?.month || p.month).toLocaleString(
        "default",
        { month: "short", year: "numeric" }
      );
      months[m] = { paiement: parseFloat(p.dataValues?.total || p.total) };
    });
    monthlyStats.reservations.forEach((r) => {
      const m = new Date(r.dataValues?.month || r.month).toLocaleString(
        "default",
        { month: "short", year: "numeric" }
      );
      months[m] = {
        ...months[m],
        reservation: parseInt(r.dataValues?.count || r.count),
      };
    });
    monthlyStats.abonnements.forEach((a) => {
      const m = new Date(a.dataValues?.month || a.month).toLocaleString(
        "default",
        { month: "short", year: "numeric" }
      );
      months[m] = {
        ...months[m],
        abonnement: parseInt(a.dataValues?.count || a.count),
      };
    });

    const monthlyRows = Object.keys(months).map((month) => [
      month,
      months[month].reservation || 0,
      months[month].paiement?.toFixed(2) || 0,
      months[month].abonnement || 0,
    ]);

    autoTable(doc, {
      head: [["Mois", "Réservations", "Revenus (€)", "Abonnements Actifs"]],
      body: monthlyRows,
      startY: nextY + 6,
      theme: "grid",
      styles: { fontSize: 10.5 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Footer
    const date = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Généré le : ${date}`, 14, doc.internal.pageSize.height - 10);

    doc.save("rapport-statistiques.pdf");
  };

  if (loading) {
    return <div className="p-4">Chargement des statistiques...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Erreur lors du chargement des statistiques: {error}
      </div>
    );
  }

  if (!stats) {
    return <div className="p-4">Aucune donnée disponible</div>;
  }

  const reservationTrendData = [
    { month: "Jan", reservations: Math.floor(stats.reservations / 6) },
    { month: "Fév", reservations: Math.floor(stats.reservations / 5) },
    { month: "Mar", reservations: Math.floor(stats.reservations / 4) },
    { month: "Avr", reservations: Math.floor(stats.reservations / 3) },
    { month: "Mai", reservations: Math.floor(stats.reservations / 2) },
    { month: "Juin", reservations: stats.reservations },
  ];

  const subscriptionData = [
    {
      name: "Abonnements Actifs",
      value: stats.abonnements,
      fill: COLORS[3],
    },
  ];

  return (
    <div style={styles.statsReports}>
      <h2 style={styles.title}>📊 Statistiques Générales</h2>
      {/* Export PDF Button */}
      <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
        <button
          onClick={() => {
            if (stats && monthlyStats) {
              handleExportPDF(stats, monthlyStats);
            } else {
              alert("Les statistiques ne sont pas encore chargées !");
            }
          }}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.7rem 1.5rem",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(37,99,235,0.12)",
            transition: "background 0.2s",
          }}
        >
          Exporter PDF
        </button>
      </div>
      {/* 2x2 Grid Container */}
      <div style={styles.gridContainer}>
        {/* ...existing chart cards... */}
        {/* Row 1 - Chart 1: Users */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>👥 Utilisateurs</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[{ name: "Utilisateurs", value: stats.users }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontWeight: "600",
                  }}
                />
                <Bar dataKey="value" fill={COLORS[0]} radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 1 - Chart 2: Reservations */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📆 Réservations</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={reservationTrendData}>
                <defs>
                  <linearGradient
                    id="colorReservations"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8} />
                    <stop
                      offset="95%"
                      stopColor={COLORS[1]}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontWeight: "600",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="reservations"
                  stroke={COLORS[1]}
                  fillOpacity={1}
                  fill="url(#colorReservations)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2 - Chart 3: Payments */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>💰 Paiements</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={[{ name: "Paiements", value: stats.payments }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontWeight: "600",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS[2]}
                  strokeWidth={4}
                  dot={{ fill: COLORS[2], strokeWidth: 2, r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2 - Chart 4: Subscriptions */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📦 Abonnements</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={280}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="30%"
                outerRadius="80%"
                data={subscriptionData}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={12}
                  fill={COLORS[3]}
                  label={{
                    position: "insideStart",
                    fill: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontWeight: "600",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={styles.subscriptionSummary}>
              <p style={styles.subscriptionValue}>{stats.abonnements}%</p>
              <p style={styles.subscriptionLabel}>Abonnements actifs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ...existing styles object...

// Inline styles for the component
const styles = {
  statsReports: {
    padding: "2.5rem 2rem",
    maxWidth: "1120px",
    margin: "3rem auto 4rem",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1e293b",
    userSelect: "none",
    background: "#f9fbff",
    borderRadius: "24px",
    boxShadow:
      "0 24px 48px rgba(31, 41, 55, 0.08), inset 0 0 24px rgba(255, 255, 255, 0.95)",
    transition: "box-shadow 0.35s ease",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "900",
    color: "#2563eb",
    marginBottom: "3rem",
    textAlign: "center",
    letterSpacing: "0.06em",
    textShadow: "0 3px 12px rgba(37, 99, 235, 0.4)",
    userSelect: "text",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2.5rem",
    marginBottom: "3rem",
  },
  chartCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "1.8rem 2rem 2.4rem",
    boxShadow:
      "0 14px 36px rgba(37, 78, 168, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.8)",
    display: "flex",
    flexDirection: "column",
    userSelect: "none",
    transition: "box-shadow 0.3s ease, transform 0.3s ease",
    cursor: "default",
  },
  chartTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "1.2rem",
    userSelect: "text",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    letterSpacing: "0.02em",
  },
  chartWrapper: {
    flex: 1,
    minHeight: "250px",
  },
  subscriptionSummary: {
    marginTop: "1.6rem",
    textAlign: "center",
    userSelect: "text",
    color: "#475569",
  },
  subscriptionValue: {
    fontSize: "2rem",
    fontWeight: "900",
    color: "#2563eb",
    marginBottom: "0.2rem",
    letterSpacing: "0.05em",
  },
  subscriptionLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: "0.04em",
  },
};

export default StatsReports;
