--Antihope, the Deity of Despair
function c13705105.initial_effect(c)
	c:EnableReviveLimit()
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND)
	e2:SetCondition(c13705105.spcon)
	e2:SetOperation(c13705105.spop)
	c:RegisterEffect(e2)
	--cannot announce
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e3:SetTargetRange(LOCATION_MZONE,0)
	e3:SetTarget(c13705105.antarget)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(23051413,0))
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCountLimit(1)
	e4:SetCode(EVENT_FREE_CHAIN)
	e4:SetCondition(c13705105.uncon)
	e4:SetCost(c13705105.cost)
	e4:SetOperation(c13705105.spop)
	c:RegisterEffect(e4)
end
function c13705105.filter(c)
	return c:IsFaceup() and c:GetLevel()==1 and c:IsAbleToGraveAsCost()
end
function c13705105.spcon(e,c)
	if c==nil then return true end
	return Duel.IsExistingMatchingCard(c13705105.filter,c:GetControler(),LOCATION_MZONE,0,4,nil)
end
function c13705105.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c13705105.filter,tp,LOCATION_MZONE,0,4,4,nil)
	local ct=Duel.SendtoGrave(g,REASON_COST)
end
function c13705105.antarget(e,c)
	return c~=e:GetHandler()
end
function c13705105.uncon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()==Duel.GetAttacker() or e:GetHandler()==Duel.GetAttackTarget()
end
function c13705105.cfilter(c)
	return c:GetLevel()==1 and c:IsAbleToRemoveAsCost()
end
function c13705105.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13705105.cfilter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c13705105.cfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c13705105.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_IMMUNE_EFFECT)
	e1:SetValue(c13705105.efilter)
	e1:SetReset(RESET_PHASE+PHASE_DAMAGE)
	c:RegisterEffect(e1)
end
function c13705105.efilter(e,te)
	return te:GetOwner()~=e:GetOwner()
end

