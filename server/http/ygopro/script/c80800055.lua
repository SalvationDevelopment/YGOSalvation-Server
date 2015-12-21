--妖精騎士イングナル　
function c80800055.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,6),3)
	c:EnableReviveLimit()
	--To Hand
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80800055,1))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCost(c80800055.cost)
	e1:SetTarget(c80800055.tg)
	e1:SetOperation(c80800055.op)
	c:RegisterEffect(e1)
end
function c80800055.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,2,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,2,2,REASON_COST)
	
end
function c80800055.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsAbleToHand,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,e:GetHandler()) end
	local sg=Duel.GetMatchingGroup(Card.IsAbleToHand,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,sg,sg:GetCount(),0,0)
	Duel.SetChainLimit(c80800055.chainlimit)
end
function c80800055.chainlimit(e,rp,tp)
	return tp==rp
end
function c80800055.op(e,tp,eg,ep,ev,re,r,rp)
	local sg=Duel.GetMatchingGroup(Card.IsAbleToHand,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,e:GetHandler())
	Duel.SendtoHand(sg,nil,REASON_EFFECT)
end