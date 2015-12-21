--Iron Resolve
function c11111117.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_PRE_BATTLE_DAMAGE)
	e1:SetCost(c11111117.cost)
	e1:SetOperation(c11111117.operation)
	c:RegisterEffect(e1)
end
function c11111117.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.PayLPCost(tp,Duel.GetLP(tp)/2)
end
function c11111117.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	Duel.ChangeBattleDamage(tp,0)
end