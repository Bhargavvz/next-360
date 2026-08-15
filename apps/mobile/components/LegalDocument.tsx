import React from 'react';
import { View } from 'react-native';
import { Spacing } from '../lib/theme';
import { Text } from './ui/Text';

export interface LegalSection {
  heading: string;
  body: string;
}

/**
 * Renders a policy document.
 *
 * Legal copy is the one place where a comfortable measure matters most — people
 * skim it. Headings sit close to their paragraph and paragraphs are separated
 * generously, so the structure is scannable without numbering every clause.
 */
export function LegalDocument({ sections }: { sections: LegalSection[] }) {
  return (
    <View style={{ marginTop: Spacing[8], gap: Spacing[6] }}>
      {sections.map((section) => (
        <View key={section.heading} style={{ gap: Spacing[2] }}>
          <Text variant="title">{section.heading}</Text>
          <Text variant="body" tone="secondary">
            {section.body}
          </Text>
        </View>
      ))}
    </View>
  );
}
