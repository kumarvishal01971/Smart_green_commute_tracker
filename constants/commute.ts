
export const COMMUTE_MODES = {
    WALKING: 'walking',
    CYCLING: 'cycling',
    PUBLIC_TRANSPORT: 'public_transport',
    CARPOOLING: 'carpooling',
    ELECTRIC_VEHICLE: 'electric_vehicle',
  };
  
  export const CO2_FACTORS = {
    [COMMUTE_MODES.WALKING]: 0,
    [COMMUTE_MODES.CYCLING]: 0,
    [COMMUTE_MODES.PUBLIC_TRANSPORT]: 0.05,
    [COMMUTE_MODES.CARPOOLING]: 0.1,
    [COMMUTE_MODES.ELECTRIC_VEHICLE]: 0.02,
  };
  