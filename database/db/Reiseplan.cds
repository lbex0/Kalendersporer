namespace kalendersporer;

using { kalendersporer.Ansatt } from './Ansatt';

entity Reiseplan 
{
  key id : Integer; 
  ansatt : Association to Ansatt;
  sted : String;
  fra_dato : Date;
  til_dato : Date;
}