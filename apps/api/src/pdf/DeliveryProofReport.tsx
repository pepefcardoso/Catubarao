import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  titleContainer: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    width: 100,
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 10,
  },
  deliverableContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
  },
  deliverableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  proofContainer: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
  },
  proofHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  proofText: {
    fontSize: 10,
    marginBottom: 5,
  },
  proofImage: {
    width: 200,
    marginTop: 5,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
});

type Proof = {
  id: string;
  deliveredAt: Date;
  evidenceType: "FOTO" | "PRINT_POST" | "LINK" | "NOTA";
  fileUrl: string | null;
  linkUrl: string | null;
  notes: string | null;
};

type Deliverable = {
  id: string;
  description: string;
  frequency: string;
  proofs: Proof[];
};

type Props = {
  partnerName: string;
  dealStartDate: Date;
  dealEndDate: Date;
  deliverables: Deliverable[];
  generationDate: Date;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const DeliveryProofReport = ({
  partnerName,
  dealStartDate,
  dealEndDate,
  deliverables,
  generationDate,
}: Props) => {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Clube Atlético Tubarão</Text>
            <Text style={styles.subtitle}>Relatório de Entregas e Contrapartidas</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.subtitle}>Gerado em: {formatDate(generationDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Contrato</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Parceiro:</Text>
            <Text style={styles.infoValue}>{partnerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Período:</Text>
            <Text style={styles.infoValue}>
              {formatDate(dealStartDate)} até {formatDate(dealEndDate)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comprovações de Entrega</Text>
          
          {deliverables.length === 0 && (
            <Text style={{ fontSize: 10, fontStyle: 'italic' }}>
              Nenhuma contrapartida cadastrada.
            </Text>
          )}

          {deliverables.map((deliverable) => (
            <View key={deliverable.id} style={styles.deliverableContainer}>
              <Text style={styles.deliverableTitle}>{deliverable.description}</Text>
              <Text style={{ fontSize: 10, color: '#666' }}>Frequência: {deliverable.frequency}</Text>
              
              {deliverable.proofs.length === 0 ? (
                <Text style={{ fontSize: 10, marginTop: 10, fontStyle: 'italic' }}>
                  Nenhuma comprovação anexada.
                </Text>
              ) : (
                deliverable.proofs.map((proof) => (
                  <View key={proof.id} style={styles.proofContainer}>
                    <Text style={styles.proofHeader}>
                      Comprovante de {formatDate(new Date(proof.deliveredAt))} ({proof.evidenceType})
                    </Text>
                    
                    {proof.notes && (
                      <Text style={styles.proofText}>Notas: {proof.notes}</Text>
                    )}
                    
                    {/* Render Image for FOTO or PRINT_POST */}
                    {(proof.evidenceType === 'FOTO' || proof.evidenceType === 'PRINT_POST') && proof.fileUrl && (
                      <Image style={styles.proofImage} src={proof.fileUrl} />
                    )}
                    
                    {/* Render Link for LINK */}
                    {proof.evidenceType === 'LINK' && proof.linkUrl && (
                      <Text style={styles.proofText}>
                        URL: <Link src={proof.linkUrl}>{proof.linkUrl}</Link>
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>
          ))}
        </View>

        <Text style={styles.footer} fixed>
          Clube Atlético Tubarão - SAF | Portal de Transparência
        </Text>
      </Page>
    </Document>
  );
};
