--Volcanic Wall
function c12346.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--Mill+Damage
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCountLimit(1)
	e2:SetCost(c12346.cost)
	e2:SetTarget(c12346.target)
	e2:SetOperation(c12346.operation)
	c:RegisterEffect(e2)
end

function c12346.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return not Duel.CheckAttackActivity(tp) end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_ATTACK_ANNOUNCE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(1,0)
	e1:SetProperty(EFFECT_FLAG_OATH)
	e1:SetReset(RESET_PHASE+RESET_END)
	Duel.RegisterEffect(e1,tp)
end
function c12346.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDiscardDeck(tp,3) end
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,tp,3)
end
function c12346.cfilter(c)
	return c:IsLocation(LOCATION_GRAVE) and c:IsType(TYPE_MONSTER) and c:IsRace(RACE_PYRO)
end
function c12346.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.DiscardDeck(tp,3,REASON_EFFECT)
	local g=Duel.GetOperatedGroup()
	local ct=g:FilterCount(c12346.cfilter,nil)
	if ct==0 then return end
	local ct=Duel.Damage(1-tp,ct*500,REASON_EFFECT)
end
