--霞の谷のファルコン
function c1074.initial_effect(c)
	--attack cost
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_ATTACK_COST)
	e1:SetCost(c1074.atcost)
	e1:SetOperation(c1074.atop)
	c:RegisterEffect(e1)
end
function c1074.atcost(e,c,tp)
	return Duel.IsExistingMatchingCard(Card.IsAbleToHandAsCost,tp,LOCATION_ONFIELD,0,1,e:GetHandler())
end
function c1074.atop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectMatchingCard(tp,Card.IsAbleToHandAsCost,tp,LOCATION_ONFIELD,0,1,1,e:GetHandler())
	Duel.SendtoHand(g,nil,REASON_COST)
end
