--Superheavy Samurai Big Wara-G
function c46523152.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c46523152.hspcon)
	e1:SetOperation(c46523152.hspop)
	c:RegisterEffect(e1)
	--double tribute
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_DOUBLE_TRIBUTE)
	e1:SetValue(c46523152.condition)
	c:RegisterEffect(e1)
end
function c46523152.filter(c)
	return c:IsType(TYPE_SPELL+TYPE_TRAP)
end
function c46523152.hspcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and not Duel.IsExistingMatchingCard(c46523152.filter,tp,LOCATION_GRAVE,0,1,nil)
end
function c46523152.hspop(e,tp,eg,ep,ev,re,r,rp,c)
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c46523152.splimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c46523152.splimit(c)
	return not c:IsSetCard(0x9a)
end
function c46523152.condition(e,c)
	return c:IsRace(RACE_MACHINE)
end
