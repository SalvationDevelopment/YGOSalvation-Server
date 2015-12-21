--グリゼイルの監獄
function c80600078.initial_effect(c)
  --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_DRAW_PHASE)
	e1:SetCondition(c80600078.con)
	e1:SetTarget(c80600078.tg)
	c:RegisterEffect(e1)
end

function c80600078.cfilter(c)
	return c:IsFaceup() and (
		bit.band(c:GetSummonType(),SUMMON_TYPE_ADVANCE)==SUMMON_TYPE_ADVANCE or 
		bit.band(c:GetSummonType(),SUMMON_TYPE_RITUAL)==SUMMON_TYPE_RITUAL or 
		bit.band(c:GetSummonType(),SUMMON_TYPE_FUSION)==SUMMON_TYPE_FUSION 
		)
end
function c80600078.con(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80600078.cfilter,tp,LOCATION_MZONE,0,1,nil)
end

function c80600078.filter(c)
	return c:IsFaceup() and (c:IsType(TYPE_SYNCHRO) or c:IsType(TYPE_XYZ))
end

function c80600078.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local c=e:GetHandler()
	--disable spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetRange(LOCATION_SZONE)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(1,1)
	e1:SetTarget(c80600078.splimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
	local g=Duel.GetMatchingGroup(c80600078.filter,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	local tc=g:GetFirst()
	while tc do
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_DISABLE)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		tc:RegisterEffect(e2)
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetCode(EFFECT_DISABLE_EFFECT)
		e3:SetValue(RESET_TURN_SET)
		e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		tc:RegisterEffect(e3)
		Duel.NegateRelatedChain(tc,RESET_TURN_SET)
		local e4=Effect.CreateEffect(c)
		e4:SetType(EFFECT_TYPE_SINGLE)
		e4:SetCode(EFFECT_CANNOT_ATTACK)
		e4:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		tc:RegisterEffect(e4)
		tc=g:GetNext()
	end
end

function c80600078.splimit(e,c,tp,sumtp,sumpos)
	return bit.band(sumtp,SUMMON_TYPE_SYNCHRO)==SUMMON_TYPE_SYNCHRO 
	or 	bit.band(sumtp,SUMMON_TYPE_XYZ)==SUMMON_TYPE_XYZ
end
