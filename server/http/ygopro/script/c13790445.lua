--Edge Imp Tomahawk
function c13790445.initial_effect(c)
	--salvage
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(13790445,0))
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,137904451)
	e1:SetCost(c13790445.cost)
	e1:SetTarget(c13790445.target)
	e1:SetOperation(c13790445.operation)
	c:RegisterEffect(e1)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(13790445,1))
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1,137904452)
	e1:SetRange(LOCATION_MZONE)
	e1:SetOperation(c13790445.activate)
	c:RegisterEffect(e1)
end
function c13790445.cfilter(c)
	return (c:IsSetCard(0x1378) or c:GetCode()==30068120) and c:IsAbleToGrave()
end
function c13790445.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790445.cfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,c13790445.cfilter,1,1,REASON_DISCARD+REASON_COST)
end
function c13790445.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
		if chk==0 then return true end
	Duel.SetTargetPlayer(1-tp)
	Duel.SetTargetParam(800)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,800)
end
function c13790445.operation(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Damage(p,d,REASON_EFFECT)
end

function c13790445.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local g=Duel.SelectMatchingCard(tp,c13790445.cfilter,tp,LOCATION_DECK,0,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoGrave(g,REASON_EFFECT)
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_CHANGE_CODE)
			e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
			e1:SetValue(g:GetFirst():GetCode())
			c:RegisterEffect(e1)
	end
end
