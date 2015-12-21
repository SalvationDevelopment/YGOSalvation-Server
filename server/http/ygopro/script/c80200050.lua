--森羅の鎮神 オレイア
function c80200050.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,7),2)
	c:EnableReviveLimit()
	--stack
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80200050,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_TOKEN)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCost(c80200050.cost)
	e1:SetOperation(c80200050.op)
	c:RegisterEffect(e1)
	--excavate
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80200050,1))
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCountLimit(1)
	e2:SetCost(c80200050.deckcost)
	e2:SetTarget(c80200050.decktg)
	e2:SetOperation(c80200050.deckop)
	c:RegisterEffect(e2)
end
function c80200050.costfilter(c)
	return c:IsAbleToGraveAsCost() and c:IsType(TYPE_MONSTER) and c:IsRace(RACE_PLANT) and (c:IsFaceup() or c:IsLocation(LOCATION_HAND))
	and c:GetLevel()>0 and Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>=c:GetLevel()
end
function c80200050.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80200050.costfilter,tp,LOCATION_HAND+LOCATION_MZONE,0,1,nil) end	
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c80200050.costfilter,tp,LOCATION_HAND+LOCATION_MZONE,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_COST)
	e:SetLabel(g:GetFirst():GetLevel())
end
function c80200050.op(e,tp,eg,ep,ev,re,r,rp)
	Duel.SortDecktop(tp,tp,e:GetLabel())
end
function c80200050.deckcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c80200050.decktg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)>0 end
end
function c80200050.deckop(e,tp,eg,ep,ev,re,r,rp)
local ct=Duel.GetFieldGroupCount(tp,LOCATION_DECK,0)
	if ct==0 then return end
	if ct>3 then ct=3 end
	local t={}
	for i=1,ct do t[i]=i end
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(80200050,2))
	local ac=Duel.AnnounceNumber(tp,table.unpack(t))
	Duel.ConfirmDecktop(tp,ac)
	local g=Duel.GetDecktopGroup(tp,ac)
	local sg=g:Filter(Card.IsRace,nil,RACE_PLANT)
	if sg:GetCount()>0 then
		Duel.DisableShuffleCheck()
		Duel.SendtoGrave(sg,REASON_EFFECT+REASON_REVEAL)
	end
	ac=ac-sg:GetCount()
	if ac>0 then
		Duel.SortDecktop(tp,tp,ac)
		for i=1,ac do
			local mg=Duel.GetDecktopGroup(tp,1)
			Duel.MoveSequence(mg:GetFirst(),1)
		end
	end
	local dg=Duel.GetMatchingGroup(Card.IsAbleToHand,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,e:GetHandler())
	if sg:GetCount()>0 and dg:GetCount()>0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOHAND)
		local rg=dg:Select(tp,1,sg:GetCount(),nil)
		Duel.HintSelection(rg)
		Duel.SendtoHand(rg,nil,2,REASON_EFFECT)
	end
end