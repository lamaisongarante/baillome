-- =====================================================================
-- Éléments de mobilier obligatoires d'un logement meublé
-- Source : décret n° 2015-981 du 31 juillet 2015, article 2, en vigueur
-- depuis le 1er septembre 2015 (Légifrance, version en vigueur au
-- 22/10/2026, copie dans docs/sources-juridiques).
-- Libellés reproduits mot pour mot, ponctuation finale exclue.
-- =====================================================================

insert into public.elements_mobilier_obligatoires (code, ordre, libelle, source, date_entree_vigueur) values
  ('literie', 1, 'Literie comprenant couette ou couverture',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 1°', '2015-09-01'),
  ('occultation', 2, 'Dispositif d''occultation des fenêtres dans les pièces destinées à être utilisées comme chambre à coucher',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 2°', '2015-09-01'),
  ('plaques_cuisson', 3, 'Plaques de cuisson',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 3°', '2015-09-01'),
  ('four', 4, 'Four ou four à micro-ondes',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 4°', '2015-09-01'),
  ('froid', 5, 'Réfrigérateur et congélateur ou, au minimum, un réfrigérateur doté d''un compartiment permettant de disposer d''une température inférieure ou égale à - 6 °C',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 5°', '2015-09-01'),
  ('vaisselle', 6, 'Vaisselle nécessaire à la prise des repas',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 6°', '2015-09-01'),
  ('ustensiles', 7, 'Ustensiles de cuisine',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 7°', '2015-09-01'),
  ('table_sieges', 8, 'Table et sièges',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 8°', '2015-09-01'),
  ('etageres', 9, 'Etagères de rangement',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 9°', '2015-09-01'),
  ('luminaires', 10, 'Luminaires',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 10°', '2015-09-01'),
  ('entretien', 11, 'Matériel d''entretien ménager adapté aux caractéristiques du logement',
    'Décret n° 2015-981 du 31 juillet 2015, art. 2, 11°', '2015-09-01');
