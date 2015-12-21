--森羅の施し
function c80200062.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c80200062.cost)
	e1:SetTarget(c80200062.target)
	e1:SetOperation(c80200062.activate)
	c:RegisterEffect(e1)
end
function c80200062.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80200062)==0 end
	Duel.RegisterFlagEffect(tp,80200062,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end
function c80200062.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,3) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(3)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,3)
end
function c80200062.filter1(c)
	return c:IsSetCard(0x90) and c:IsAbleToDeck()
end
function c80200062.filter2(c)
	return c:IsAbleToDeck()
end
function c80200062.activate(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
	Duel.BreakEffect()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.GetMatchingGroup(c80200062.filter1,p,LOCATION_HAND,0,nil)
	if g:GetCount()>0 then
		g=g:Select(p,1,1,nil)
		local sg=Duel.SelectMatchingCard(p,c80200062.filter2,p,LOCATION_HAND,0,1,1,g:GetFirst())
		sg:Merge(g)
		Duel.ConfirmCards(1-p,sg)
		Duel.SendtoDeck(sg,nil,0,REASON_EFFECT)
		Duel.SortDecktop(tp,tp,sg:GetCount())
		Duel.ShuffleHand(p)
	else
		local sg=Duel.GetFieldGroup(p,LOCATION_HAND,0)
		Duel.ConfirmCards(1-p,sg)
		Duel.SendtoDeck(sg,nil,0,REASON_EFFECT)
		Duel.SortDecktop(tp,tp,sg:GetCount())
	end
end