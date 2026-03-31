"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Clause } from "./ClauseCard";

// Since we are in a browser environment, standard fonts are available.
// For more custom looks, we could register fonts, but Helvetica is professional.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  headerDate: {
    fontSize: 10,
    color: "#666666",
    textTransform: "uppercase",
  },
  summarySection: {
    marginBottom: 40,
    flexDirection: "row",
    gap: 30,
  },
  scoreCard: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    marginTop: 4,
    color: "#666666",
  },
  verdictCard: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  verdictLabel: {
    fontSize: 8,
    fontWeight: "bold",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: 100,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  verdictText: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 1.2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 5,
    marginBottom: 15,
  },
  clauseCard: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  clauseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  clauseTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  riskBadge: {
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#000000",
    textTransform: "uppercase",
  },
  auditSummary: {
    fontSize: 10,
    color: "#666666",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  plainEnglish: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 20,
  },
  detailsCol: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 8,
    color: "#888888",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  intelligenceSection: {
    marginTop: 20,
  },
  intelligenceItem: {
    marginBottom: 10,
    flexDirection: "row",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    backgroundColor: "#000000",
    marginTop: 4,
  },
  intelligenceText: {
    fontSize: 10,
    fontWeight: "bold",
    flex: 1,
  },
  disclaimer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 10,
    fontSize: 7,
    color: "#999999",
    textAlign: "center",
    textTransform: "uppercase",
  },
});

interface AuditReportProps {
  results: {
    overall_score: number;
    overall_verdict: string;
    clauses: Clause[];
    questions_to_ask: string[];
    suggested_changes: string[];
  };
}

export const AuditReport = ({ results }: AuditReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>BeforeSign Audit</Text>
        </View>
        <Text style={styles.headerDate}>
          Extracted on {new Date().toLocaleDateString()}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{results.overall_score}</Text>
          <Text style={styles.scoreLabel}>Risk Index</Text>
        </View>
        <View style={styles.verdictCard}>
          <Text style={styles.verdictLabel}>Executive Verdict</Text>
          <Text style={styles.verdictText}>{results.overall_verdict}</Text>
        </View>
      </View>

      {/* Clause Audit */}
      <Text style={styles.sectionTitle}>Clause Audit</Text>
      {results.clauses.map((clause) => (
        <View key={clause.clause_number} style={styles.clauseCard} wrap={false}>
          <View style={styles.clauseHeader}>
            <Text style={styles.clauseTitle}>
              {clause.clause_number.toString().padStart(2, "0")} {clause.clause_title}
            </Text>
            <Text style={[
              styles.riskBadge, 
              { backgroundColor: clause.risk_level === "safe" ? "#FFFFFF" : "#FFFF00" }
            ]}>
              {clause.risk_level}
            </Text>
          </View>
          
          <Text style={styles.auditSummary}>Audit Summary</Text>
          <Text style={styles.plainEnglish}>{clause.plain_english}</Text>
          
          <View style={styles.detailsGrid}>
            {clause.why_risky && (
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>The Risk</Text>
                <Text style={styles.detailsText}>{clause.why_risky}</Text>
              </View>
            )}
            {clause.suggestion && (
              <View style={styles.detailsCol}>
                <Text style={styles.detailsLabel}>The Solution</Text>
                <Text style={styles.detailsText}>{clause.suggestion}</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Strategic Intelligence */}
      <View style={styles.intelligenceSection} wrap={false}>
        <Text style={styles.sectionTitle}>Strategic Intelligence</Text>
        
        <Text style={styles.auditSummary}>Necessary Inquiries</Text>
        {results.questions_to_ask.slice(0, 5).map((q, i) => (
          <View key={i} style={styles.intelligenceItem}>
            <View style={styles.bullet} />
            <Text style={styles.intelligenceText}>{q}</Text>
          </View>
        ))}

        <Text style={[styles.auditSummary, { marginTop: 15 }]}>Critical Edits</Text>
        {results.suggested_changes.slice(0, 5).map((c, i) => (
          <View key={i} style={styles.intelligenceItem}>
            <View style={[styles.bullet, { backgroundColor: "#FFFF00", border: '1px solid black' }]} />
            <Text style={styles.intelligenceText}>{c}</Text>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        This is an AI-generated audit. It is not a legal document. Consult a qualified attorney before making any legal decisions.
      </Text>
    </Page>
  </Document>
);
