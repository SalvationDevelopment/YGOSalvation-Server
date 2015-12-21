--アーティファクト－デュランダル
function c80200049.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,5),2)
	c:EnableReviveLimit()
	--change effect
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80200049,0))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_CHAINING)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c80200049.condition)
	e1:SetTarget(c80200049.target1)
	e1:SetCost(c80200049.cost)
	e1:SetOperation(c80200049.activate)
	c:RegisterEffect(e1)
	--reload
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80200049,1))
	e2:SetCategory(CATEGORY_TODECK+CATEGORY_DRAW)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCost(c80200049.cost)
	e2:SetTarget(c80200049.target)
	e2:SetOperation(c80200049.operation)
	c:RegisterEffect(e2)
end
function c80200049.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(80200049)==0 and e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	Duel.Hint(HINT_OPSELECTED,1-tp,e:GetDescription())
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	e:GetHandler():RegisterFlagEffect(80200049,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
function c80200049.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,LOCATION_SZONE,0,1,nil) 
	end
end
function c80200049.repop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsType(TYPE_SPELL+TYPE_TRAP)then
	c:CancelToGrave(false)
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local dg=Duel.SelectMatchingCard(tp,Card.IsDestructable,tp,0,LOCATION_SZONE,1,1,nil)
	if dg then
		Duel.HintSelection(dg)
		Duel.Destroy(dg,REASON_EFFECT)
	end
end
function c80200049.condition(e,tp,eg,ep,ev,re,r,rp)
	local rc=re:GetHandler()
	return 
		(rc:GetType()==TYPE_SPELL or rc:GetType()==TYPE_TRAP and re:IsHasType(EFFECT_TYPE_ACTIVATE)) or
		(Duel.GetChainInfo(ev,CHAININFO_TRIGGERING_LOCATION)==LOCATION_MZONE and re:IsActiveType(TYPE_MONSTER))	
end
function c80200049.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Group.CreateGroup()
	Duel.ChangeTargetCard(ev,g)
	Duel.ChangeChainOperation(ev,c80200049.repop)
end
function c80200049.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp) and Duel.IsPlayerCanDraw(1-tp)
		and (
		Duel.IsExistingMatchingCard(Card.IsAbleToDeck,tp,LOCATION_HAND,0,1,nil) 
		or 
		Duel.IsExistingMatchingCard(Card.IsAbleToDeck,tp,0,LOCATION_HAND,1,nil)  
		)
	end
	Duel.SetOperationInfo(0,CATEGORY_TODECK,nil,1,PLAYER_ALL,LOCATION_HAND)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,PLAYER_ALL,1)
end
function c80200049.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(tp,LOCATION_HAND,0)	
	local g1=Duel.GetFieldGroup(tp,0,LOCATION_HAND)
	if g:GetCount()+g1:GetCount() >0 then 
	Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
	Duel.SendtoDeck(g1,nil,2,REASON_EFFECT)
	Duel.ShuffleDeck(tp)
	Duel.ShuffleDeck(1-tp)
	Duel.BreakEffect()
	Duel.Draw(tp,g:GetCount(),REASON_EFFECT)
	Duel.Draw(1-tp,g1:GetCount(),REASON_EFFECT)
	end
end