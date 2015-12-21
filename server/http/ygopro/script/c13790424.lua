--Yuki Usagi
function c13790424.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_O)
	e1:SetRange(LOCATION_HAND+LOCATION_MZONE)
	e1:SetCode(EVENT_CHAINING)
	e1:SetCountLimit(1,13790424)
	e1:SetCost(c13790424.cost)
	e1:SetCondition(c13790424.condition)
	e1:SetTarget(c13790424.target)
	e1:SetOperation(c13790424.activate)
	c:RegisterEffect(e1)
end
function c13790424.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToGraveAsCost() end
	Duel.SendtoGrave(e:GetHandler(),REASON_COST)
end
function c13790424.condition(e,tp,eg,ep,ev,re,r,rp)
	local rc=re:GetHandler()
	return rc:IsOnField() and rc:IsControler(1-tp) and (rc:IsType(TYPE_SPELL+TYPE_TRAP)
		and not re:IsHasType(EFFECT_TYPE_ACTIVATE)) or (re:IsHasType(EFFECT_TYPE_IGNITION))
end
function c13790424.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return re:GetHandler():IsDestructable() end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
end
function c13790424.activate(e,tp,eg,ep,ev,re,r,rp)
	if re:GetHandler():IsRelateToEffect(re) then
		Duel.Destroy(eg,REASON_EFFECT)
	end
end
