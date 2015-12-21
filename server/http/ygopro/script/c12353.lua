--Volcanic Armor
function c12353.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--damage
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(12353,0))
	e2:SetCategory(CATEGORY_DAMAGE)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCondition(c12353.condition)
	e2:SetTarget(c12353.target)
	e2:SetOperation(c12353.operation)
	c:RegisterEffect(e2)
end
function c12353.filter(c,tp)
	return c:IsType(TYPE_MONSTER) and c:IsRace(RACE_PYRO) and c:GetControler()==tp and c:IsPreviousLocation(LOCATION_ONFIELD) and c:IsReason(REASON_DESTROY)
end
function c12353.condition(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c12353.filter,1,nil,tp) 
end
function c12353.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsRelateToEffect(e) end
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(500)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,0,0,1-tp,500)
end
function c12353.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Damage(p,d,REASON_EFFECT)
end
