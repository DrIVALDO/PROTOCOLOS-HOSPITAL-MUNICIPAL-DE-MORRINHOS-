import React, { useEffect, useState } from 'react';
import { SepseConfigModal } from './sepse/SepseConfigModal';
import { INITIAL_CONFIG, INITIAL_CHECKLISTS } from './sepse/sepseDefaultData';
import { ConfigDict, CheckItem } from './sepse/sepseTypes';

interface SepseStandaloneConfigProps {
  onClose: () => void;
}

export const SepseStandaloneConfig: React.FC<SepseStandaloneConfigProps> = ({ onClose }) => {
  const [config, setConfig] = useState<ConfigDict>(INITIAL_CONFIG);
  const [checklists, setChecklists] = useState(INITIAL_CHECKLISTS);
  const [sectionOrder, setSectionOrder] = useState<string[]>(['s6', 's7']);
  const [logos, setLogos] = useState<{ [key: string]: string | null }>({ '1': null, '2': null, '3': null });
  const [password, setPassword] = useState('HMM@2026');

  // Load from local storage dynamically on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('hmm_sepse_v2_cfg');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis config:", e);
    }

    try {
      const savedChecks = localStorage.getItem('hmm_sepse_v4_chk');
      if (savedChecks) {
        setChecklists(JSON.parse(savedChecks));
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis checklists:", e);
    }

    try {
      const savedOrder = localStorage.getItem('hmm_sepse_v3_secorder');
      if (savedOrder) {
        setSectionOrder(JSON.parse(savedOrder));
      } else {
        setSectionOrder(['s6', 's7']);
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis section order:", e);
      setSectionOrder(['s6', 's7']);
    }

    try {
      const savedLogos = localStorage.getItem('hmm_sepse_pop_logos');
      if (savedLogos) {
        setLogos(JSON.parse(savedLogos));
      }
    } catch (e) {
      console.warn("Failed loading saved sepsis POP logos:", e);
    }

    const savedPassword = localStorage.getItem('hmm_sepse_v2_senha');
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  const handleSaveConfigModal = (
    newConfig: ConfigDict,
    newChecklists: { pacote: CheckItem[]; cuidados: CheckItem[] },
    newSectionOrder: string[],
    newLogos: { [key: string]: string | null },
    newPassword?: string
  ) => {
    // Commit to state
    setConfig(newConfig);
    setChecklists(newChecklists);
    setSectionOrder(newSectionOrder);
    setLogos(newLogos);
    
    // Commit to localStorage
    localStorage.setItem('hmm_sepse_v2_cfg', JSON.stringify(newConfig));
    localStorage.setItem('hmm_sepse_v4_chk', JSON.stringify(newChecklists));
    localStorage.setItem('hmm_sepse_v3_secorder', JSON.stringify(newSectionOrder));
    localStorage.setItem('hmm_sepse_pop_logos', JSON.stringify(newLogos));
    
    if (newPassword) {
      setPassword(newPassword);
      localStorage.setItem('hmm_sepse_v2_senha', newPassword);
    }

    onClose();
  };

  return (
    <SepseConfigModal
      initialConfig={config}
      initialChecklists={checklists}
      initialSectionOrder={sectionOrder}
      initialLogos={logos}
      currentPassword={password}
      onClose={onClose}
      onSave={handleSaveConfigModal}
    />
  );
};
