--SNo.39 希望皇ホープONE
function c80500001.initial_effect(c)
	--xyz summon
	c:EnableReviveLimit()
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_LIGHT),4),3,c80500001.ovfilter,aux.Stringid(80500001,1))
	--destroy
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY+CATEGORY_DAMAGE)
	e1:SetDescription(aux.Stringid(80500001,0))
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c80500001.condition)
	e1:SetCost(c80500001.cost)
	e1:SetTarget(c80500001.target)
	e1:SetOperation(c80500001.operation)
	c:RegisterEffect(e1)
end
function c80500001.ovfilter(c)
	return c:IsFaceup() and c:IsCode(84013237)
end
function c80500001.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetLP(tp)<=Duel.GetLP(1-tp)-3000
end
function c80500001.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLP(tp)>10 and e:GetHandler():CheckRemoveOverlayCard(tp,3,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,3,3,REASON_COST)
	Duel.PayLPCost(tp,Duel.GetLP(tp)-10)
end
function c80500001.filter(c)
	return c:IsDestructable() and bit.band(c:GetSummonType(),SUMMON_TYPE_SPECIAL)==SUMMON_TYPE_SPECIAL
end
function c80500001.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c80500001.filter(chkc) end
	if chk==0 then return Duel.IsExistingMatchingCard(c80500001.filter,tp,0,LOCATION_MZONE,1,nil) end
	local sg=Duel.GetMatchingGroup(c80500001.filter,tp,0,LOCATION_MZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,sg,sg:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,sg:GetCount()*300)
end
function c80500001.operation(e,tp,eg,ep,ev,re,r,rp)
	local sg=Duel.GetMatchingGroup(c80500001.filter,tp,0,LOCATION_MZONE,nil)
	local ct=Duel.Destroy(sg,REASON_EFFECT,LOCATION_REMOVED)
	if ct>0 then
		Duel.BreakEffect()
		Duel.Damage(1-tp,ct*300,REASON_EFFECT)
	end
end
