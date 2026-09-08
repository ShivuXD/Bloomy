import React from 'react';
import Peco, { PecoProps } from './Peco';

const PecoMascot: React.FC<PecoProps> = (props) => {
  return <Peco {...props} />;
};

export default PecoMascot;

