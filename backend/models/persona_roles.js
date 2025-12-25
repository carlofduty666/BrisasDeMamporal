'use strict';

module.exports = (sequelize, DataTypes) => {
  const Persona_Roles = sequelize.define('Persona_Roles', {
    personaID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    rolID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: 'Persona_Roles',
    timestamps: false
  });

  return Persona_Roles;
};
