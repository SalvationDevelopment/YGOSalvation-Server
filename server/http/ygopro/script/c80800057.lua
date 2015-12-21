--ダウナード・マジシャン
function c80800057.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsRace,RACE_SPELLCASTER),4),2)
	c:EnableReviveLimit()
	--spsummon proc
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c80800057.spcon)
	e2:SetOperation(c80800057.spop)
	c:RegisterEffect(e2)
	--atkup
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EFFECT_UPDATE_ATTACK)
	e2:SetValue(c80800057.atkval)
	c:RegisterEffect(e2)
	--pierce
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_PIERCE)
	c:RegisterEffect(e3)
	--remove material
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80800057,1))
	e4:SetCategory(CATEGORY_DESTROY)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e4:SetCode(EVENT_BATTLED)
	e4:SetOperation(c80800057.op)
	c:RegisterEffect(e4)
	
end
function c80800057.spfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:GetRank()<4
end
function c80800057.spcon(e,c)
	if c==nil then return true end
	return 	Duel.IsExistingMatchingCard(c80800057.spfilter,c:GetControler(),LOCATION_MZONE,0,1,nil)
	and		Duel.GetCurrentPhase()==PHASE_MAIN2
end
function c80800057.spop(e,tp,eg,ep,ev,re,r,rp,c)
	local mg=Duel.SelectMatchingCard(tp,c80800057.spfilter,tp,LOCATION_MZONE,0,1,1,nil)
	local mg2=mg:GetFirst():GetOverlayGroup()
	if mg2:GetCount()~=0 then
		Duel.Overlay(c,mg2)
	end
	Duel.Overlay(c,mg)
	c:SetMaterial(mg)
end
function c80800057.atkval(e,c)
	return e:GetHandler():GetOverlayCount()*200
end
function c80800057.op(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:GetOverlayCount()>0 then
		c:RemoveOverlayCard(tp,1,1,REASON_EFFECT)
	end
end