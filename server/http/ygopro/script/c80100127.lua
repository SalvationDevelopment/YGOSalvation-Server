--Sephira Exa the Flame Beast Nekroz
function c80100127.initial_effect(c)
--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--splimit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTargetRange(1,0)
	e2:SetTarget(c80100127.splimit)
	c:RegisterEffect(e2)
	--special summon(hand)
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100127,0))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetRange(LOCATION_HAND)
	e3:SetCode(EVENT_DESTROYED)
	e3:SetCountLimit(1,80100127)
	e3:SetCondition(c80100127.spcon1)
	e3:SetTarget(c80100127.sptg)
	e3:SetOperation(c80100127.spop)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100127,0))
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetRange(LOCATION_HAND)
	e4:SetCode(EVENT_DESTROYED)
	e4:SetCountLimit(1,80100127)
	e4:SetCondition(c80100127.spcon2)
	e4:SetTarget(c80100127.sptg)
	e4:SetOperation(c80100127.spop)
	c:RegisterEffect(e4)
end
function c80100127.splimit(e,c,tp,sumtp,sumpos)
	return not c:IsSetCard(0xb8) and not c:IsSetCard(0xc3) and bit.band(sumtp,SUMMON_TYPE_PENDULUM)==SUMMON_TYPE_PENDULUM
end
function c80100127.spfilter(c,tp)
	return c:IsPreviousLocation(LOCATION_MZONE) and c:GetPreviousControler()==tp and c:IsType(TYPE_MONSTER)
	and c:IsSetCard(0xc3 or 0xb8)
end
function c80100127.cfilter(c,tp)
	return c:IsPreviousLocation(LOCATION_SZONE) and c:IsPreviousPosition(POS_FACEUP) and c:GetPreviousControler()==tp
		and c:IsReason(REASON_EFFECT) and c:IsType(TYPE_MONSTER) and c:IsSetCard(0xb7 or 0xb8)
end
function c80100127.spcon1(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c80100127.spfilter,1,nil,tp)
end
function c80100127.spcon2(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c80100127.cfilter,1,nil,tp)
end
function c80100127.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c80100127.spop(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():IsRelateToEffect(e) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
end