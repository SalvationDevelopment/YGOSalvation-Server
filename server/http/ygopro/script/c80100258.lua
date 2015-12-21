--煉獄の氾爛
function c80100258.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--token
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100258,0))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_TOKEN)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c80100258.tkcon)
	e2:SetTarget(c80100258.tktg)
	e2:SetOperation(c80100258.tkop)
	c:RegisterEffect(e2)
	--cannot be target
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e3:SetRange(LOCATION_SZONE)
	e3:SetTargetRange(LOCATION_MZONE,0)
	e3:SetTarget(c80100258.target)
	e3:SetValue(c80100258.value)
	c:RegisterEffect(e3)
	local e4=e3:Clone()
	e4:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	c:RegisterEffect(e4)
	--
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(80100258,1))
	e5:SetType(EFFECT_TYPE_SINGLE)
	e5:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e5:SetRange(LOCATION_SZONE)
	e5:SetCode(80100258)
	c:RegisterEffect(e5)
end
function c80100258.tkcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c80100258.tktg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c80100258.tkop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<1 then return end
	if not Duel.IsPlayerCanSpecialSummonMonster(tp,80101258,0,0x4011,0,0,1,RACE_FIEND,ATTRIBUTE_FIRE) then return end
	local token=Duel.CreateToken(tp,80101258)
	Duel.SpecialSummon(token,0,tp,tp,false,false,POS_FACEUP)
end
function c80100258.tgfilter(c,lvl)
	return c:IsSetCard(0xb9) and c:IsFaceup() and c:GetLevel()>lvl
end
function c80100258.target(e,c)
	return c:IsSetCard(0xb9) and c:IsFaceup() and Duel.IsExistingMatchingCard(c80100258.tgfilter,tp,LOCATION_MZONE,0,1,nil,c:GetLevel()) 
end
function c80100258.value(e,re,rp)
	return rp~=e:GetOwnerPlayer()
end